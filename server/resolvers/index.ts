interface InternalDataItem {
  id: string;
  name: string;
  value: string;
  createdAt: string;
}

// In-memory storage for demo purposes
const internalData: InternalDataItem[] = [
  {
    id: '1',
    name: 'demo-config',
    value: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'feature-flag',
    value: 'enabled',
    createdAt: new Date().toISOString(),
  },
];

export const resolvers = {
  Query: {
    health: () => ({
      status: 'healthy',
      message: 'Apollo Server is running successfully!',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    }),
    
    internalData: () => internalData,
  },

  Mutation: {
    createInternalData: (_: any, { name, value }: { name: string; value: string }) => {
      const newItem: InternalDataItem = {
        id: String(internalData.length + 1),
        name,
        value,
        createdAt: new Date().toISOString(),
      };
      
      internalData.push(newItem);
      return newItem;
    },
  },
};