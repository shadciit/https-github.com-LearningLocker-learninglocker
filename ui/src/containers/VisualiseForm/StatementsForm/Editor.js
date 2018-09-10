import React, { Component, PropTypes } from 'react';
import { Map, toJS, fromJS } from 'immutable';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { updateModel } from 'ui/redux/modules/models';
import Tabs from 'ui/components/Material/Tabs';
import { withModel } from 'ui/utils/hocs';
import { withProps } from 'recompose';
import { Tab } from 'react-toolbox/lib/tabs';
import TypeEditor from './TypeEditor';
import ExportForm from 'ui/components/ExportForm';
import { getDefaultProjectionFromType } from 'ui/redux/modules/exports';
import ProjectionInput from 'ui/containers/ProjectionInput';
import SeriesEditor from './SeriesEditor';
import AxesEditor from './AxesEditor/AxesEditor';
import styles from '../visualiseform.css';
import OptionsEditor from './OptionsEditor';

const SCHEMA = 'visualisation';

class Editor extends Component {
  static propTypes = {
    model: PropTypes.instanceOf(Map),
    exportVisualisation: PropTypes.func
  }

  state = {
    step: 0,
  }

  changeAttr = attr => newValue =>
    this.props.updateModel({
      schema: SCHEMA,
      id: this.props.model.get('_id'),
      path: attr,
      value: newValue
    })

  getActiveProjection = () => {
    const { model } = this.props;
    const { activeIndex } = this.state;
    return model.get('statementColumns')
  }

  onChangeProjection = (projection) => {

    if (projection) {
      this.props.updateModel({
        schema: SCHEMA,
        id: this.props.model.get('_id'),
        path: ['statementColumns'],
        value: projection
      });
    }

  }

  onChangeAttr = attr => event =>
    this.changeAttr(attr)(event.target.value)

  changeStep = step =>
    this.setState({ step })

  hasType = () =>
    this.props.model.has('type')

  isSeriesType = () => false;

  renderTypeEditor = () =>
    <TypeEditor model={this.props.model} />


  renderDescription = description => (
    <div className="form-group">
      <label htmlFor="lrsDescriptionInput">Name</label>
      <input
        id="lrsDescriptionInput"
        className="form-control"
        placeholder="What does this visualisation show?"
        value={description}
        onChange={this.onChangeAttr('description')} />
    </div>
  )

  renderTabs = () => {
    // The Tabs component requires its children to be Tab items
    // We cannot do inline conditionals, therefore we construct the children and pass them in via the props
    const tabs = [
      <Tab key="axes" label="Axes"><AxesEditor model={this.props.model} /></Tab>,
      <Tab key="options" label="Options">{ this.renderOptionsEditor() }</Tab>
    ];
    const statementTabs = [
      <Tab key="Columns" label="Columns">
        <ProjectionInput
          projection={this.getActiveProjection()}
          isStatementVisualisation={1}
          onChange={this.onChangeProjection} />
      </Tab>
    ];

    const isStatement = this.props.model.get('type') === 'STATEMENT';
    const isCounter = this.props.model.get('type') === 'COUNTER';
    const seriesTab = <Tab key="series" label="Series">{ this.renderSeriesEditor() }</Tab>;
    const StatementSeriesTab = <Tab key="filter" label="Filter">{ this.renderSeriesEditor() }</Tab>;
    if (isStatement) {
      statementTabs.splice(1, 0, StatementSeriesTab);
    } else if (isCounter) {
      tabs.splice(1, 0, StatementSeriesTab);
    } else {
      tabs.splice(1, 0, seriesTab);
    }

    return (
      <div className={styles.tab}>
        { this.renderDescription(this.props.model.get('description')) }
        <Tabs index={this.state.step} onChange={this.changeStep}> children={isStatement ? statementTabs : tabs}</Tabs>
      </div>
    );
  }

  renderSeriesEditor = () => (
    <SeriesEditor
      model={this.props.model}
      exportVisualisation={this.props.exportVisualisation} />
  )

  renderOptionsEditor = () => (
    <OptionsEditor
      model={this.props.model} />
  )

  renderSteps = () => (
    this.isSeriesType() ? this.renderSeriesEditor() : this.renderTabs()
  )

  render = () => (
    this.hasType() ? this.renderSteps() : this.renderTypeEditor()
  )
}

export default (
  withStyles(styles),
  connect(() => ({}), { updateModel })
)(Editor);
