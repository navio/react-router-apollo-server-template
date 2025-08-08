# Campaign Builder Feature

A comprehensive campaign creation form with real-time validation, server-side business rules, and modern UX patterns.

## 🏗️ Architecture Overview

The Campaign Builder implements a multi-layered validation architecture with clear separation of concerns:

### Validation Layers
1. **Real-time Field Validation** - Immediate feedback as user types
2. **Cross-field Validation** - Complex business rules (date relationships, duration limits)
3. **Client-side Submission Validation** - Final validation with data transformations
4. **Server-side Validation** - Business rules and profanity filtering

### Technology Stack
- **React Hook Form + Zod** - Type-safe form validation
- **Zustand** - Lightweight state management
- **GraphQL + Apollo** - Server communication
- **Tailwind CSS** - Responsive styling
- **TypeScript** - Type safety throughout

## 🎯 Features

### ✅ Form Validation
- **Campaign Name**: 3-15 characters, alphanumeric + spaces only
- **Budget**: $10-$1000 range with currency formatting
- **Date Validation**: End date must be after start date
- **Duration Limit**: Maximum 30 days campaign duration
- **Real-time Feedback**: Errors shown immediately as user types

### ✅ Server Integration
- **GraphQL Mutations** - Clean API communication
- **Server-side Validation** - Business rules enforcement
- **Profanity Filtering** - Campaign name content filtering
- **Error Mapping** - Server errors mapped to form fields

### ✅ User Experience
- **Success Toast** - Visual feedback on successful creation
- **Form Clearing** - Automatic form reset after success
- **Loading States** - Submit button disabled during processing
- **Responsive Design** - Works on all screen sizes

## 📁 File Structure

```
app/features/campaign-builder/
├── hooks/
│   └── useCampaignForm.ts          # Form logic and validation
├── pages/
│   └── campaign-builder.tsx        # Main component
├── services/
│   └── campaign-service.ts         # GraphQL operations
└── stores/
    └── campaign-store.ts           # Zustand state management

app/shared/
└── campaign-schema.ts              # Zod validation schemas

server/
├── resolvers/index.ts              # GraphQL resolvers
└── schema/typeDefs.ts             # GraphQL schema

tests/
└── campaign-builder.test.tsx      # Comprehensive test suite
```

## 🧪 Testing

Comprehensive test coverage including:
- Form rendering and field validation
- Cross-field validation (date relationships)
- Budget validation and formatting
- Form clearing functionality
- Error handling scenarios

```bash
npm test tests/campaign-builder.test.tsx
```

## 🔧 Key Implementation Details

### Multi-Schema Validation Strategy

We use different Zod schemas for different validation contexts:

1. **`campaignFieldSchema`** - Real-time validation without transformations
2. **`campaignSubmissionSchema`** - Form submission with data transformations
3. **`serverCampaignSchema`** - Server-side with business rules

This separation ensures:
- Real-time validation doesn't break user experience
- Data transformations happen at the right time
- Server validation can enforce additional business rules

### Apollo Client Smart Routing

The Apollo Client automatically routes operations to the correct GraphQL endpoint:
- Campaign operations → Internal server
- Character operations → External Rick & Morty API

### Error Handling Pattern

Errors are handled at multiple levels:
1. **Field-level** - Individual field validation errors
2. **Cross-field** - Complex business rule violations
3. **Server-level** - Backend validation and business rules
4. **Network-level** - Connection and timeout errors

## 🚀 Usage Example

```typescript
// The component handles all complexity internally
<CampaignBuilder />

// Form automatically provides:
// - Real-time validation
// - Server communication
// - Error handling
// - Success feedback
// - State management
```

## 🔄 Data Flow

1. **User Input** → Real-time field validation
2. **Form Submit** → Cross-field validation
3. **Data Transform** → String to Number/Date conversion
4. **GraphQL Mutation** → Server validation & storage
5. **Success Response** → Toast notification & form clear
6. **Error Response** → Error mapping to form fields

## 🎨 Design System

Custom Tailwind CSS components provide consistent styling:
- `.form-input` - Standard input styling with focus states
- `.form-input-error` - Error state styling
- `.btn-primary` / `.btn-secondary` - Button variants
- `.card` - Container styling

## 📝 Future Enhancements

- **Draft Saving** - Save campaigns as drafts
- **Campaign Templates** - Pre-defined campaign types
- **Advanced Validation** - Custom business rules
- **Bulk Operations** - Create multiple campaigns
- **Campaign Analytics** - Performance tracking integration

## 🧑‍💻 Development Notes

### Adding New Validation Rules
1. Update the appropriate Zod schema in `campaign-schema.ts`
2. Add corresponding error messages
3. Update tests to cover new validation
4. Consider UX impact of new restrictions

### Extending the GraphQL Schema
1. Update `typeDefs.ts` with new fields
2. Add resolver logic in `index.ts`
3. Update client-side TypeScript interfaces
4. Add corresponding form fields if needed

### Performance Considerations
- Debounced validation to prevent excessive API calls
- Optimistic updates for better perceived performance
- Lazy loading of non-critical components
- Bundle size monitoring for production builds