import React from 'react';
import StatementsForm from './StatementsForm';
import NewVisualisation from './NewVisualisation';

const VisualiseForm = ({ model, orgTimezone }) => {
  if (model.has('type')) {
    return (
      <StatementsForm
        model={model}
        orgTimezone={orgTimezone} />
    );
  }

  // A new visualisation does not have "type"
  return <NewVisualisation visualisationModel={model} />;
};

export default VisualiseForm;
