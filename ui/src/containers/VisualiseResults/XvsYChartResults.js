import React from 'react';
import { withStatementsVisualisation } from 'ui/utils/hocs';
import XvsY from 'ui/components/XvsY';
import { shorten } from 'ui/utils/defaultTitles';

export default withStatementsVisualisation(({
  getFormattedResults,
  results,
  labels,
  colors,
  model,
  axes,
  trendLines
}) => (
  <XvsY
    colors={colors}
    results={getFormattedResults(results)}
    labels={labels}
    model={model}
    trendLines={trendLines}
    axesLabels={{
      xLabel: shorten(model.getIn(['axesxValue', 'searchString'], 'X-Axis')),
      yLabel: shorten(model.getIn(['axesyValue', 'searchString'], 'Y-Axis'))
    }} />
  ));
