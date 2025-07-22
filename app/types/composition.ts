export interface IComposition {
  id?: string;
  aspectRatio: {
    width: number;
    height: number;
  };
}

export type NewComposition = Omit<IComposition, 'id'>;
export type CompositionUpdate = Partial<IComposition>;
