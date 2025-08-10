# Category Seeding System

This document explains how the category seeding system works and how to manage categories in the FeathersUp ticketing system.

## Overview

The system automatically seeds 10 common support categories when the backend starts up. These categories cover the most common types of support requests that every company typically handles.

## Default Categories

The following categories are automatically created:

1. **Technical Support** - Hardware, software, and system-related technical issues
2. **Account & Billing** - Account management, billing questions, and payment issues
3. **Feature Request** - New feature suggestions and enhancement requests
4. **Bug Report** - Software bugs, errors, and unexpected behavior
5. **General Inquiry** - General questions about products, services, or company
6. **Access & Permissions** - User access, login issues, and permission requests
7. **Integration Support** - Third-party integrations and API-related issues
8. **Training & Documentation** - Training requests and documentation questions
9. **Performance Issues** - Slow performance, timeouts, and optimization requests
10. **Data & Privacy** - Data-related questions, privacy concerns, and GDPR requests

## Automatic Seeding

Categories are automatically seeded when:
- The backend server starts up
- The database is synced (using `sequelize.sync()`)
- The `runAllSeeders()` function is called

The seeding process:
1. Checks if categories already exist
2. If no categories exist, creates all default categories
3. If categories exist, skips seeding to avoid duplicates

## Adding More Categories

### Method 1: API Endpoints

#### Single Category Creation
```http
POST /api/categories
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Custom Category",
  "description": "Description of the custom category",
  "color": "#ff6b6b"
}
```

#### Bulk Category Creation (Super Agents Only)
```http
POST /api/categories/bulk
Authorization: Bearer <token>
Content-Type: application/json

{
  "categories": [
    {
      "name": "Category 1",
      "description": "Description 1",
      "color": "#ff6b6b"
    },
    {
      "name": "Category 2",
      "description": "Description 2",
      "color": "#4ecdc4"
    }
  ]
}
```

### Method 2: CLI Scripts

#### Seed Default Categories
```bash
npm run seed:categories
# or
node seed-categories.js seed
```

#### Reset and Re-seed Categories
```bash
npm run reset:categories
# or
node seed-categories.js reset
```

#### Add Single Category (Interactive)
```bash
npm run add:category
# or
node seed-categories.js add
```

### Method 3: Programmatic

```javascript
const { addCategory } = require('./src/seeders/categorySeeder');

// Add a single category
await addCategory({
  name: 'Custom Category',
  description: 'Description',
  color: '#ff6b6b',
  isActive: true
});
```

## Category Management

### Viewing Categories

- **Active Categories**: `GET /api/categories` (all users)
- **All Categories**: `GET /api/categories/all` (super agents only)

### Updating Categories

```http
PUT /api/categories/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description",
  "color": "#newcolor",
  "isActive": true
}
```

### Deleting Categories (Soft Delete)

```http
DELETE /api/categories/:id
Authorization: Bearer <token>
```

**Note**: Only super agents can delete categories. Categories are soft-deleted (marked as inactive) rather than permanently removed.

## Category Model

Each category has the following properties:

- `id`: Unique identifier (auto-increment)
- `name`: Category name (unique, 2-100 characters)
- `description`: Optional description (max 500 characters)
- `color`: Hex color code for UI display (default: #007bff)
- `isActive`: Whether the category is active (default: true)
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

## Best Practices

1. **Naming**: Use clear, descriptive names that users will understand
2. **Colors**: Choose distinct colors to make categories easily distinguishable
3. **Descriptions**: Provide helpful descriptions for agents and customers
4. **Active Status**: Deactivate categories instead of deleting them to preserve ticket history
5. **Bulk Operations**: Use bulk endpoints when adding multiple categories

## Troubleshooting

### Categories Not Seeding
- Check database connection
- Verify Category model is properly imported
- Check console logs for seeding errors

### Duplicate Categories
- The system prevents duplicate names automatically
- Use the reset command if you need to start fresh

### Permission Errors
- Ensure user has appropriate role (agent for creation, super agent for deletion)
- Check JWT token validity

## Development

To modify the default categories, edit `src/seeders/categorySeeder.js` and update the `defaultCategories` array.

To add new seeding logic, extend the `src/seeders/index.js` file and add your seeder functions there. 