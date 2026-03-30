import { AgentFile } from '../api/agent.dto';
import { Document } from './types';

export const documentMapper = {

  toDomainFromAgent: (agentFile: AgentFile): Document => ({
    id: `agent-${agentFile.sequenceId}`,
    no: agentFile.sequenceId,
    fileName: agentFile.fileName,
    status: agentFile.status as Document['status'],
  })
};