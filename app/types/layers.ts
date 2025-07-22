export type LayerType = 'text' | 'image' | 'camera';

export type ScalingMode = 'fill' | 'fit' | 'none';

interface IPosition {
  x: number;
  y: number;
}

interface ISize {
  width: number;
  height: number;
}

interface IBaseLayer {
  id?: string;
  order: number;
  visible: boolean;
  scaling?: ScalingMode;
}

export interface ITextLayer extends IBaseLayer {
  type: 'text';
  content: string;
  fontSize: number;
  color: string;
  position: IPosition;
}

export interface IImageLayer extends IBaseLayer {
  type: 'image';
  url: string;
  position: IPosition;
  size: ISize;
  scaling: ScalingMode;
}

export interface ICameraLayer extends IBaseLayer {
  type: 'camera';
  scaling: ScalingMode;
}

export type Layer = (ITextLayer | IImageLayer | ICameraLayer) & { id: string };

export type NewLayer = Omit<ITextLayer, 'id'> | Omit<IImageLayer, 'id'> | Omit<ICameraLayer, 'id'>;

export type LayerUpdate = Partial<Layer>;
