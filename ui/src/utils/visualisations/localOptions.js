import { Map, OrderedMap } from 'immutable';
import {
  XVSY,
  STATEMENTS,
  LEADERBOARD,
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

const createOptionModel = (searchString, optionKey) => new Map({ optionKey, searchString });

const createOptionModels = options => (new OrderedMap(options)).map(createOptionModel);

export const UNIQUENESS_OPS = [
  'uniqueCount', 'uniqueAverage', 'uniqueMax', 'uniqueMin'
];


const LINE_OPERATOR_OPTS = new OrderedMap({
  uniqueCount: 'Total unique number of',
  count: 'Sum of',
  average: 'Average of',
  max: 'Max from',
  min: 'Min from',
});

export const OPERATOR_OPTS = LINE_OPERATOR_OPTS.concat(new OrderedMap({
  uniqueAverage: 'Average unique number of',
  uniqueMax: 'Max unique number of',
  uniqueMin: 'Min unique number of',
}));

export const VALUE_OPTS = createOptionModels({
  scaled: 'Scaled results',
  raw: 'Raw results',
  steps: 'Steps',
});

export const UNIQUENESS_VALUE_OPTS = createOptionModels({
  statements: 'Statements',
  people: 'People',
  activities: 'Activities',
  verb: 'Verbs',
  type: 'Activity types',
}).concat(VALUE_OPTS);

export const GROUP_OPTS = createOptionModels({
  date: 'Date',
  hour: 'Hour',
  weekday: 'Day',
  month: 'Month',
  year: 'Year',
  people: 'Person',
  activities: 'Activity',
  verb: 'Verb',
  type: 'Activity Type',
  raw: 'Raw Result',
  response: 'Result Response',
});

export const getTypeOpts = (type) => {
  switch (type) {
    case FREQUENCY:
    case TEMPLATE_ACTIVITY_OVER_TIME:
      return LINE_OPERATOR_OPTS;
    case XVSY:
    case STATEMENTS:
    case LEADERBOARD:
    case COUNTER:
    case PIE:
    case TEMPLATE_LAST_7_DAYS_STATEMENTS:
    case TEMPLATE_MOST_ACTIVE_PEOPLE:
    case TEMPLATE_MOST_POPULAR_ACTIVITIES:
    case TEMPLATE_MOST_POPULAR_VERBS:
    case TEMPLATE_WEEKDAYS_ACTIVITY:
    case TEMPLATE_CURATR_INTERACTIONS_VS_ENGAGEMENT:
    case TEMPLATE_CURATR_COMMENT_COUNT:
    case TEMPLATE_CURATR_LEARNER_INTERACTIONS_BY_DATE_AND_VERB:
    case TEMPLATE_CURATR_USER_ENGAGEMENT_LEADERBOARD:
    case TEMPLATE_CURATR_PROPORTION_OF_SOCIAL_INTERACTIONS:
    case TEMPLATE_CURATR_ACTIVITIES_WITH_MOST_COMMENTS:
    case TEMPLATE_POORLY_PERFORMING_QUESTIONS:
    case TEMPLATE_POORLY_PERFORMING_QUIZZES:
      return OPERATOR_OPTS;
    default:
      return new OrderedMap();
  }
};
