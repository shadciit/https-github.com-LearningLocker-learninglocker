import { OrderedMap } from 'immutable';
import commonIndexesMigration from './20171122100800_common_indexes';
import updateRefs from './20171121153300_update_refs';
import expiration from './20180212_expiration';
import migrateIdentifiers from './20171127214900_migrate_identifiers';
import personasIndexes from './20171008104700_personas_indexes';

export default new OrderedMap()
  .set('20171122100800_common_indexes', commonIndexesMigration)
  .set('20171121153300_update_refs', updateRefs)
  .set('20171008104700_personas_indexes', personasIndexes)
  .set('20171127214900_migrate_identifiers', migrateIdentifiers)
  .set('20180212_expiration', expiration);
