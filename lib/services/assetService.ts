import { Db, ObjectId } from 'mongodb';
import clientPromise from '../db';
import { Frame, Guide, Background, AssetType } from '../../types/admin';

/**
 * Service class for managing frames, guides, and backgrounds
 * Provides methods for CRUD operations and asset selection
 */
export class AssetService {
  private db: Promise<Db>;
  
  constructor() {
    this.db = clientPromise.then(client => client.db());
  }

  /**
   * Get the collection name for a given asset type
   */
  private getCollectionName(type: AssetType): string {
    switch (type) {
      case 'frame': return 'frames';
      case 'guide': return 'guides';
      case 'background': return 'backgrounds';
    }
  }

  /**
   * Create a new asset
   */
  async createAsset<T extends Frame | Guide | Background>(
    type: AssetType,
    asset: Omit<T, '_id' | 'createdAt' | 'updatedAt'>
  ): Promise<T> {
    const collection = (await this.db).collection(this.getCollectionName(type));
    
    const now = new Date();
    const newAsset = {
      ...asset,
      createdAt: now,
      updatedAt: now,
      isActive: true,
      isSelected: false
    };

    const result = await collection.insertOne(newAsset);
    return { ...newAsset, _id: result.insertedId } as T;
  }

  /**
   * Get all assets of a specific type
   */
  async getAssets<T extends Frame | Guide | Background>(type: AssetType): Promise<T[]> {
    const collection = (await this.db).collection(this.getCollectionName(type));
    return collection.find<T>({}).sort({ createdAt: -1 }).toArray();
  }

  /**
   * Get the currently selected asset of a specific type
   */
  async getSelectedAsset<T extends Frame | Guide | Background>(type: AssetType): Promise<T | null> {
    const collection = (await this.db).collection(this.getCollectionName(type));
    return collection.findOne<T>({ isSelected: true });
  }

  /**
   * Update an existing asset
   */
  async updateAsset<T extends Frame | Guide | Background>(
    type: AssetType,
    id: string,
    update: Partial<T>
  ): Promise<T | null> {
    const collection = (await this.db).collection(this.getCollectionName(type));
    
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: {
          ...update,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    if (!result || !result.value) {
      throw new Error('Asset not found or could not be updated');
    }
    return result.value as T;
  }

  /**
   * Delete an asset
   */
  async deleteAsset(type: AssetType, id: string): Promise<boolean> {
    const collection = (await this.db).collection(this.getCollectionName(type));
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount === 1;
  }

  /**
   * Select an asset (and deselect others)
   * If no asset is explicitly selected, select the first active asset
   */
  async selectAsset(type: AssetType, id: string | null): Promise<void> {
    const collection = (await this.db).collection(this.getCollectionName(type));
    
    // First, deselect all assets of this type
    await collection.updateMany({}, { $set: { isSelected: false } });
    
    // If an ID is provided, select that asset
    if (id) {
      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { isSelected: true } }
      );
    } else {
      // If no asset is selected, select the first active asset
      const activeAsset = await collection.findOne({ isActive: true });
      if (activeAsset) {
        await collection.updateOne(
          { _id: activeAsset._id },
          { $set: { isSelected: true } }
        );
      }
    }
  }

  /**
   * Toggle an asset's active state and handle selection
   * If activating and no other asset is selected, select this one
   */
  async toggleAssetActive(type: AssetType, id: string): Promise<boolean> {
    const collection = (await this.db).collection(this.getCollectionName(type));
    const asset = await collection.findOne({ _id: new ObjectId(id) });
    
    if (!asset) return false;
    
    const newActiveState = !asset.isActive;
    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { isActive: newActiveState, updatedAt: new Date() } }
    );

    // If we're activating this asset and no other asset is selected, select this one
    if (newActiveState) {
      const selectedAsset = await collection.findOne({ isSelected: true });
      if (!selectedAsset) {
        await collection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { isSelected: true } }
        );
      }
    } else if (asset.isSelected) {
      // If we're deactivating a selected asset, find another active one to select
      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { isSelected: false } }
      );
      const nextActiveAsset = await collection.findOne({ isActive: true });
      if (nextActiveAsset) {
        await collection.updateOne(
          { _id: nextActiveAsset._id },
          { $set: { isSelected: true } }
        );
      }
    }
    
    return true;
  }
}
