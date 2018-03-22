import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { getMetadataSelector } from 'ui/redux/modules/metadata';
import { Iterable } from 'immutable';
import {
  compose,
  setPropTypes,
  defaultProps,
  withHandlers,
  setDisplayName,
  withProps,
  withState,
  lifecycle
} from 'recompose';
import Spinner from 'ui/components/Spinner';
import DeleteButton from 'ui/containers/DeleteButton';
import ModelListItem from 'ui/containers/ModelListItem';

const enhance = compose(
  setPropTypes({
    schema: PropTypes.string.isRequired,
    isLoading: PropTypes.bool.isRequired,
    hasMore: PropTypes.bool.isRequired,
    models: PropTypes.instanceOf(Iterable).isRequired,
    model: PropTypes.object,
    fetchMore: PropTypes.func.isRequired,
    ModelForm: PropTypes.func.isRequired,
    displayOwner: PropTypes.bool,
    buttons: PropTypes.arrayOf(PropTypes.func),
    modifyButtons: PropTypes.func,
    getDescription: PropTypes.func
  }),
  defaultProps({
    getDescription: model => model.get('description', ''),
    buttons: [DeleteButton],
    displayOwner: true,
    modifyButtons: buttons => buttons
  }),
  connect(
    (state, {
      schema,
      models
    }) => {
      const metadata = models.map(
        model => getMetadataSelector({ schema, id: model.get('_id') })(state)
      );

      const sortedModels = models.sort((a, b) => {
        const aIsNew = metadata.getIn([a.get('_id'), 'isNew'], false);
        const bIsNew = metadata.getIn([b.get('_id'), 'isNew'], false);

        if (aIsNew && bIsNew) {
          if (a.get('createdAt') < b.get('createdAt')) return 1; // b is newer
          if (a.get('createdAt') > b.get('createdAt')) return -1; // a is newer
          return 0;
        }
        if (aIsNew && !bIsNew) return -1;
        if (!aIsNew && bIsNew) return 1;

        return 0;
      });
      return { models: sortedModels };
    }
  ),
  withHandlers({
    fetchMore: ({ schema, filter, sort, fetchMore }) =>
      () => fetchMore({ schema, filter, sort })
  }),
  withProps(({
    models,
    model
  }) =>
    ({
      modelsWithModel: (!model || !model.get('_id') || models.has(model.get('_id')) ?
        models :
          models.reverse().set(model.get('_id'), model).reverse()
      )
    })
  ),
  withState('isExpandedOnce', 'setExpandedOnce', false),
  lifecycle({
    componentWillReceiveProps: ({
      setMetadata,
      isExpandedOnce,
      setExpandedOnce,
      model
    }) => {
      // If this component also has a withModel hoc on it,
      // then we want that to be expanded by default.
      if (model && model.get('_id') && isExpandedOnce === false) {
        // this works because setMetadata comes from the withModel hoc (as opposed to withModels)
        setMetadata('isExpanded', true);
        setExpandedOnce(true);
      }
    }
  }),
  setDisplayName('ModelList')
);

const renderLoadMoreButton = ({ isLoading, hasMore, fetchMore }) =>
  (
    <div style={{ marginTop: '20px' }}>
      { isLoading ? (
        <Spinner />
      ) : (
        hasMore &&
          <button className="btn btn-default" onClick={fetchMore} >
            Load more
          </button>
      )}
    </div>
  );

const render = ({
  isLoading,
  modelsWithModel,
  schema,
  ModelForm,
  getDescription,
  buttons,
  hasMore,
  fetchMore,
  modifyButtons,

  ...other
}) => {
  if (modelsWithModel.size > 0) {
    return (
      <div>
        { modelsWithModel.map(model =>
          <ModelListItem
            {...other}
            key={model.get('_id')}
            model={model}
            schema={schema}
            getDescription={getDescription}
            ModelForm={ModelForm}
            buttons={modifyButtons(buttons, modelsWithModel)} />
        ).valueSeq() }

        { isLoading
          ? <Spinner />
          : renderLoadMoreButton({ isLoading, hasMore, fetchMore })
        }
      </div>
    );
  } else if (isLoading) {
    return <Spinner />;
  }
  return (
    <div className="row">
      <div className="col-md-12"><h4>No items.</h4></div>
    </div>
  );
};

export default enhance(render);
