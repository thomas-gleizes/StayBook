export type ActionType = "domain" | "command" | "query";

export interface FQN {
  org: string;
  app: string;
  type: string;
  name: string;
  version: string;
  actionType?: ActionType;
  actionName?: string;
}

export function parseFQN(fqn: string): FQN {
  const parts = fqn.split(".");

  const [org, app, type, name, version, actionType, actionName] = parts;

  return {
    org,
    app,
    type,
    name,
    version,
    actionType: actionType as ActionType,
    actionName,
  };
}
