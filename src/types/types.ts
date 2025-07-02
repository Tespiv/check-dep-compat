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

export type TPackageSuggestionDTO = {
  name: string;
  full_name: string;
  description: string;
  html_url: string;
};

export type TRegistryDTO = {
  name: string;
  'dist-tags': {
    latest: string;
  };
  description: string;
  homepage: string;
};

export type TResultsSearch = {
  items: TPackageSuggestionDTO[];
};

export type TResultSearch = {
  items: TPackageSuggestionDTO;
};

export type TVersion = {
  name: string;
};
