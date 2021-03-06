export interface ContentfulConfig {
  space: string;
  accessToken: string;
}

export interface ContentfulPreviewConfig {
  space: string;
  accessToken: string;
  host: string;
}

export type SLACK_NOTIFICATION_TYPE = "SERVER" | "CONTENTFUL" | "SENTRY";

export interface SlackNotification {
  name: string;
  message: string;
  function?: unknown;
  type?: "info" | "error";
}

export interface PortfolioWork {
  image: {
    sys: {
      type: "Link";
      linkType: "Asset";
      id: string;
    };
  };
  title: string;
  description: string;
  link: string;
  github: string;
  created_year: number;
}

export interface BlogCategory {
  categoryName: string;
  categoryId: string;
  color: string;
  priority: number;
}

export interface BlogLgtm {
  good: number;
  bad: number;
}

export type BlogLgtmType = "good" | "bad";
export type BlogLgtmAction = "increment" | "decrement";

export interface BlogContent {
  title: string;
  id: string;
  description: string;
  thumbnail: {
    sys: {
      type: "Link";
      linkType: "Asset";
      id: string;
    };
  };
  body: unknown;
  category: {
    sys: {
      type: "Link";
      linkType: "Entry";
      id: string;
    };
  };
  author: {
    sys: {
      type: "Link";
      linkType: "Entry";
      id: string;
    };
  };
}

export interface Author {
  name: string;
  description: string;
  image: {
    sys: {
      type: "Link";
      linkType: "Asset";
      id: string;
    };
  };
}

export interface BlogContentHeading {
  data: Record<string, unknown>;
  content: {
    data: Record<string, unknown>;
    marks: [];
    value: string;
    nodeType: string;
  }[];
  nodeType: string;
}

export interface RoadmapItem {
  label: string;
  completed: boolean;
}

export type RoadmapStateType = "merge" | "develop" | "schedule";

export interface RoadmapFields {
  content: string;
  completed: boolean;
  state: RoadmapStateType[];
}

export interface NewsItem {
  text: string;
  date: string;
  image: {
    sys: {
      id: string;
    };
    fields: {
      title: string;
      file: {
        url: string;
      };
    };
  };
}

export interface CtfContent {
  data: Record<string, string>;
  content?: CtfContent[];
  marks?: any[];
  value?: string;
  nodeType: string;
  ogp?: Record<string, string> | null;
}
