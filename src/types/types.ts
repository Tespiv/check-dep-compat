export type TPackageSuggestion = {
  name: string;
  version: string | null;
  description: string;
  npm: string;
};

export type TPackageSuggestionVersion = {
  version: string | null;
};

export type TFilterObjects = {
  objects: TItem[];
};

export type TItem = {
  package: {
    name: string;
    version: string;
    description: string;
    links: {
      npm: string;
    };
  };
};

export type TRegistryDTO = {
  name: string;
  'dist-tags': {
    latest: string;
  };
  description: string;
  homepage: string;
};

export type TInfoConflict = {
  peerName: string;
  requiredRange: string;
  actualVersion: string;
};
