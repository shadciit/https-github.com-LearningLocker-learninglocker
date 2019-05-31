import React, { Component, PropTypes } from 'react';
import { Map } from 'immutable';
import { compose, withProps } from 'recompose';
import { createSelector } from 'reselect';
import { connect } from 'react-redux';
import { TEMPLATE_STAGE_INTERMEDIATE } from 'lib/constants/visualise';
import { updateModel } from 'ui/redux/modules/models';
import VisualiseResults from 'ui/containers/VisualiseResults';
import SourceResults from 'ui/containers/VisualiseResults/SourceResults';
import { withSchema } from 'ui/utils/hocs';
import { isContextActivity } from 'ui/utils/visualisations';
import {
  getMetadataSelector,
  setInMetadata
} from 'ui/redux/modules/metadata';

import Editor from './Editor';
import PreviewPeriodPicker from './PreviewPeriodPicker';
import NewVisualisation from './NewVisualisation';

export const toggleSourceSelector = ({ id }) => createSelector(
  [getMetadataSelector({ schema: 'visualisation', id })],
  metadata =>
    metadata.get('source')
);

class StatementsForm extends Component {
  static propTypes = {
    model: PropTypes.instanceOf(Map),
    queryBuilderCacheValueModels: PropTypes.instanceOf(Map),
    isLoading: PropTypes.bool, // eslint-disable-line react/no-unused-prop-types
    filter: PropTypes.instanceOf(Map), // eslint-disable-line react/no-unused-prop-types
    hasMore: PropTypes.bool, // eslint-disable-line react/no-unused-prop-types
    updateModel: PropTypes.func,
    exportVisualisation: PropTypes.func
  }

  static defaultProps = {
    model: new Map(),
    queryBuilderCacheValueModels: new Map(),
  }

  shouldComponentUpdate = nextProps => !(
    this.props.model.equals(nextProps.model) &&
      (this.props.source === nextProps.source) &&
      (this.props.queryBuilderCacheValueModels.equals(nextProps.queryBuilderCacheValueModels))
  )

  onChangePreviewPeriod = previewPeriod => this.props.updateModel({
    schema: 'visualisation',
    id: this.props.model.get('_id'),
    path: 'previewPeriod',
    value: previewPeriod,
  })

  hasType = () => this.props.model.has('type')
  hasTemplateId = () => this.props.model.get('templateId', null) !== null
  isOnTemplateIntermediateStage = () => this.props.model.get('templateStage') === TEMPLATE_STAGE_INTERMEDIATE;

  /**
   * @returns {boolean}
   */
  shouldShowNewVisualisation = () =>
    !this.hasType() || (
      this.hasTemplateId() && this.isOnTemplateIntermediateStage()
    )

  renderEditor = () => (
    <Editor
      model={this.props.model}
      queryBuilderCacheValueModels={this.props.queryBuilderCacheValueModels}
      exportVisualisation={this.props.exportVisualisation}
      shouldShowNewVisualisation={this.shouldShowNewVisualisation()} />
  );

  renderFormWithResults = () => (
    <div className="row">
      <div className="col-md-6 left-border">
        { this.renderEditor() }
      </div>
      <div
        className="col-md-6">
        <div className="form-group form-inline" style={{ textAlign: 'right' }}>
          <PreviewPeriodPicker
            visualisation={this.props.model}
            onChange={this.onChangePreviewPeriod} />
        </div>
        <div style={{ height: '400px', paddingTop: 5 }}>
          {!this.props.model.get('sourceView') && <VisualiseResults id={this.props.model.get('_id')} />}
          {this.props.model.get('sourceView') &&
            <SourceResults id={this.props.model.get('_id')} />
          }
        </div>
      </div>
    </div>
  );

  render = () => {
    if (this.shouldShowNewVisualisation()) {
      return (
        <div className="row">
          <div className="col-md-12 left-border">
            <NewVisualisation visualisationModel={this.props.model} />;
          </div>
        </div>
      );
    }
    return this.renderFormWithResults();
  }
}

const withQueryBuilderCacheValueModels = compose(
  withSchema('querybuildercachevalue'),
  withProps(({ models }) => ({
    queryBuilderCacheValueModels: models,
  }))
);

export default withQueryBuilderCacheValueModels(
  connect(
    (state, ownProps) => {
      const searchString = ownProps.model.getIn(['axesgroup', 'searchString'], '');
      const filter = isContextActivity(searchString) ?
        new Map({ path: new Map({ $eq: `${searchString}.definition.type` }) }) :
        new Map({});

      return {
        hasMore: ownProps.hasMore,
        isLoading: ownProps.isLoading,
        source: toggleSourceSelector({ id: ownProps.model.get('_id') })(state),
        filter,
      };
    },
    { updateModel, setInMetadata }
  )(StatementsForm)
);