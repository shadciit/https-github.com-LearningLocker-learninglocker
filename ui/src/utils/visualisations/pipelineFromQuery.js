import { Map, fromJS } from 'immutable';
import { memoize } from 'lodash';
import {
  LEADERBOARD,
  XVSY,
  STATEMENTS,
  FREQUENCY,
  COUNTER,
  PIE,
  TEMPLATE_ACTIVITY_OVER_TIME,
  TEMPLATE_LAST_7_DAYS_STATEMENTS,
  TEMPLATE_MOST_ACTIVE_PEOPLE,
  TEMPLATE_MOST_POPULAR_ACTIVITIES,
  TEMPLATE_MOST_POPULAR_VERBS,
  TEMPLATE_WEEKDAYS_ACTIVITY,
  TEMPLATE_CURATR_INTERACTIONS_VS_ENGAGEMENT,
  TEMPLATE_CURATR_COMMENT_COUNT,
  TEMPLATE_CURATR_LEARNER_INTERACTIONS_BY_DATE_AND_VERB,
  TEMPLATE_CURATR_USER_ENGAGEMENT_LEADERBOARD,
  TEMPLATE_CURATR_PROPORTION_OF_SOCIAL_INTERACTIONS,
  TEMPLATE_CURATR_ACTIVITIES_WITH_MOST_COMMENTS,
  TEMPLATE_POORLY_PERFORMING_QUESTIONS,
  TEMPLATE_POORLY_PERFORMING_QUIZZES,
} from 'lib/constants/visualise';
import { update$dteTimezone } from 'lib/helpers/update$dteTimezone';
import { periodToDate } from 'ui/utils/dates';
import aggregateChart from 'ui/utils/visualisations/aggregateChart';
import aggregateCounter from 'ui/utils/visualisations/aggregateCounter';
import aggregateXvsY from 'ui/utils/visualisations/aggregateXvsY';
import buildPipelinesForTemplatePoorlyPerformingQuestions from 'ui/containers/Visualisations/TemplatePoorlyPerformingQuestions/buildPipelines';
import buildPipelinesForTemplatePoorlyPerformingQuizzes from 'ui/containers/Visualisations/TemplatePoorlyPerformingQuizzes/buildPipelines';

/**
 * build pipeline from query
 *
 * @param {immutable.Map} args - optional (default is empty Map)
 */
export default memoize((args = new Map()) => {
  const previewPeriod = args.get('previewPeriod');
  const timezone = args.get('timezone');
  const currentMoment = args.get('currentMoment');

  let previewPeriodMatch = [{ $match: {
    timestamp: { $gte: { $dte: periodToDate(previewPeriod, timezone, currentMoment).toISOString() } }
  } }];

  if (args.get('benchmarkingEnabled')) {
    const previousStartDate = periodToDate(previewPeriod, timezone, currentMoment, 2).toISOString();
    previewPeriodMatch = [{ $match: {
      timestamp: { $gte: { $dte: previousStartDate }, $lte: { $dte: periodToDate(previewPeriod, timezone, currentMoment).toISOString() } }
    } }];
  }

  const query = args.getIn(['query', '$match'], new Map());
  // Set timezone of When filters (timestamp and stored)
  const offsetFixedQuery = update$dteTimezone(query, timezone);
  const queryMatch = offsetFixedQuery.size === 0 ? [] : [{ $match: offsetFixedQuery }];

  const preReqs = fromJS(previewPeriodMatch.concat(queryMatch));

  const type = args.get('type');
  const axes = args.get('axes');

  switch (type) {
    case LEADERBOARD:
    case PIE:
    case STATEMENTS:
    case FREQUENCY:
    case TEMPLATE_ACTIVITY_OVER_TIME:
    case TEMPLATE_MOST_ACTIVE_PEOPLE:
    case TEMPLATE_MOST_POPULAR_ACTIVITIES:
    case TEMPLATE_MOST_POPULAR_VERBS:
    case TEMPLATE_WEEKDAYS_ACTIVITY:
    case TEMPLATE_CURATR_LEARNER_INTERACTIONS_BY_DATE_AND_VERB:
    case TEMPLATE_CURATR_USER_ENGAGEMENT_LEADERBOARD:
    case TEMPLATE_CURATR_PROPORTION_OF_SOCIAL_INTERACTIONS:
    case TEMPLATE_CURATR_ACTIVITIES_WITH_MOST_COMMENTS:
      return aggregateChart(preReqs, axes, timezone);
    case XVSY:
    case TEMPLATE_CURATR_INTERACTIONS_VS_ENGAGEMENT:
      return aggregateXvsY(preReqs, axes, timezone);
    case TEMPLATE_POORLY_PERFORMING_QUESTIONS:
      return buildPipelinesForTemplatePoorlyPerformingQuestions(preReqs);
    case TEMPLATE_POORLY_PERFORMING_QUIZZES:
      return buildPipelinesForTemplatePoorlyPerformingQuizzes(preReqs);
    case COUNTER:
    case TEMPLATE_LAST_7_DAYS_STATEMENTS:
    case TEMPLATE_CURATR_COMMENT_COUNT:
      return aggregateCounter(preReqs, axes, timezone);
    default:
      return query;
  }
}, iterable => iterable.toJS());
