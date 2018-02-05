import { map } from 'bluebird';
import { head, tail, find, flatten } from 'lodash';
import {
  getPersonaName,
  getIfis,
  getAttributes
} from 'lib/services/importPersonas/personasImportHelpers';
import reasignPersonaStatements from 'lib/services/persona/reasignPersonaStatements';
import PersonasImport from 'lib/models/personasImport';
import { validateIfi } from 'lib/services/persona/validateIfi';
import updateQueryBuilderCache from './updateQueryBuilderCache';

export default ({
  personaImportId,
  structure,
  organisation,
  personaService,
}) => async (row, rowIndex) => {
  const personaName = getPersonaName({
    structure,
    row
  });

  const ifis = getIfis({
    structure,
    row
  });

  const erroringIfis = ifis
    .filter(ifi =>
      validateIfi(ifi, ['ifi']).length > 0
    );

  if (erroringIfis.length > 0) {
    const errors = erroringIfis.map(ifi =>
      validateIfi(ifi, ['ifi'])
    );
    const flattenedErrors = flatten(errors);

    const result = await PersonasImport.findOneAndUpdate({
      _id: personaImportId
    }, {
      processedCount: 1,
      $push: {
        importErrors: {
          row: rowIndex,
          rowErrors: flattenedErrors.map(err => `${err.path.join('.')}: ${err.data}`)
        }
      }
    }, {
      new: true
    });

    return {
      processedCount: result.processedCount,
      totalCount: result.totalCount
    };
  }

  // Create or update persona identifier
  const personaIdentifiers = await map(
    ifis,
    ifi => personaService.createUpdateIdentifierPersona({
      organisation,
      personaName,
      ifi
    })
  );

  // if created identifier exists, then it is merged.
  const merged = !find(personaIdentifiers, ({ wasCreated }) => wasCreated);

  const personaIds = await map(personaIdentifiers, ({ personaId }) => personaId);
  const toPersonaId = head(personaIds);
  const fromPersonaIds = tail(personaIds);

  // Merge personas
  await map(fromPersonaIds, (fromPersonaId) => {
    if (toPersonaId === fromPersonaId) {
      // Do nothing, as the ifi already points to this persona.
      return;
    }

    return Promise.all([
      personaService.mergePersona({
        organisation,
        toPersonaId,
        fromPersonaId
      }),
      reasignPersonaStatements({
        organisation,
        fromId: fromPersonaId,
        toId: toPersonaId
      })
    ]);
  });

  // Additional infomation
  const attributes = getAttributes({
    structure,
    row
  });

  await map(attributes, (attribute) => {
    personaService.overwritePersonaAttribute({
      organisation,
      personaId: toPersonaId,
      ...attribute
    });
  });

  await updateQueryBuilderCache({
    attributes,
    organisation
  });

  const result = await PersonasImport.findOneAndUpdate({
    _id: personaImportId
  }, {
    $inc: {
      processedCount: 1,
      'result.merged': merged ? 1 : 0,
      'result.created': !merged ? 1 : 0
    },
  }, {
    new: true
  });

  return {
    merged,
    processedCount: result.processedCount,
    totalCount: result.totalCount
  };
};