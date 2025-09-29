
import { NewsCluster } from '../types';

// The default clusters have been removed to prevent API calls on initial load
// and to encourage users to add their own sources.
export const newsClusters: NewsCluster[] = [];