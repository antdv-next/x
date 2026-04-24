export interface CatalogComponent {
  type: "object";
  allOf?: any[];
  properties?: Record<string, any>;
  required?: string[];
  [key: string]: any;
}

export interface Catalog {
  $schema?: string;
  $id?: string;
  title?: string;
  description?: string;
  catalogId?: string;
  components?: Record<string, CatalogComponent>;
  functions?: Record<string, any>;
  $defs?: Record<string, any>;
}

export interface PathValue {
  path: string;
}

export interface LiteralStringValue {
  literalString: string;
}

export interface ExplicitList {
  explicitList: string[];
}

export interface XCardComponent_v08 {
  id: string;
  component: {
    [componentType: string]: {
      child?: string;
      children?: string[] | ExplicitList;
      [key: string]: any;
    };
  };
}

export interface XCardComponent_v09 {
  id: string;
  component: string;
  child?: string;
  children?: string[];
  [key: string]: any;
}

export interface XCardNode {
  type: string;
  props: Record<string, any>;
  children?: string[];
}

export interface CreateSurfaceCommand {
  version?: "v0.9";
  createSurface: {
    surfaceId: string;
    catalogId?: string;
  };
}

export interface UpdateComponentsCommand {
  version?: "v0.9";
  updateComponents: {
    surfaceId: string;
    components: XCardComponent_v09[];
  };
}

export interface UpdateDataModelCommand {
  version?: "v0.9";
  updateDataModel: {
    surfaceId: string;
    path: string;
    value: any;
  };
}

export interface DeleteSurfaceCommand {
  version?: "v0.9";
  deleteSurface: {
    surfaceId: string;
  };
}

export interface SurfaceUpdateCommand {
  surfaceUpdate: {
    surfaceId: string;
    components: XCardComponent_v08[];
  };
}

export interface DataModelUpdateCommand {
  dataModelUpdate: {
    surfaceId: string;
    contents: Array<{
      key: string;
      valueString?: string;
      valueMap?: Array<{
        key: string;
        valueString: string;
      }>;
    }>;
  };
}

export interface BeginRenderingCommand {
  beginRendering: {
    surfaceId: string;
    root: string;
  };
}

export type XCardCommand =
  | CreateSurfaceCommand
  | UpdateComponentsCommand
  | UpdateDataModelCommand
  | DeleteSurfaceCommand
  | SurfaceUpdateCommand
  | DataModelUpdateCommand
  | BeginRenderingCommand;
