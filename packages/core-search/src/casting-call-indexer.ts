import { algoliasearch } from 'algoliasearch';

// Basic casting call shape expected by indexer
export interface CastingCallRecord {
  id: string;
  title: string;
  description?: string | null;
  company?: string | null;
  location?: string | null;
  skills?: string[] | null;
  status: string;
  createdAt: Date;
  updatedAt?: Date | null;
  isAggregated?: boolean | null;
  deadline?: Date | null;
}

const CASTING_CALLS_INDEX = 'casting_calls';

function getWriteClient() {
  const appId = process.env.ALGOLIA_APP_ID;
  const writeKey = process.env.ALGOLIA_WRITE_API_KEY;
  if (!appId || !writeKey) {
    throw new Error('Algolia credentials missing: ALGOLIA_APP_ID and ALGOLIA_WRITE_API_KEY are required');
  }
  return algoliasearch(appId, writeKey);
}

export async function indexCastingCall(castingCall: CastingCallRecord): Promise<void> {
  const client = getWriteClient();
  const body = {
    objectID: castingCall.id,
    title: castingCall.title,
    description: castingCall.description ?? undefined,
    company: castingCall.company ?? undefined,
    location: castingCall.location ?? undefined,
    skills: castingCall.skills ?? [],
    status: castingCall.status,
    createdAt: castingCall.createdAt,
    updatedAt: castingCall.updatedAt ?? undefined,
    isAggregated: castingCall.isAggregated ?? undefined,
    deadline: castingCall.deadline ?? undefined,
  };

  await client.saveObject({
    indexName: CASTING_CALLS_INDEX,
    body,
  });
}

export async function deleteCastingCall(castingCallId: string): Promise<void> {
  const client = getWriteClient();
  await client.deleteObject({
    indexName: CASTING_CALLS_INDEX,
    objectID: castingCallId,
  });
}


