# Contributing to CabriThon

Thank you for your interest in contributing to CabriThon! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Submitting Changes](#submitting-changes)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive experience for everyone. We expect all contributors to:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

Before you begin, ensure you have:

1. Read the `README.md` for project overview
2. Followed `SETUP.md` to set up your local environment
3. Reviewed `ARCHITECTURE.md` to understand the system design

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/CabriThon.git
   cd CabriThon
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/ORIGINAL-OWNER/CabriThon.git
   ```

### Create a Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
# or
git checkout -b docs/your-documentation-update
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding or updating tests
- `chore/` - Maintenance tasks

## Development Workflow

### Backend Development

#### Running the API

```bash
cd backend/CabriThon.Api
dotnet watch run
```

#### Adding a New Endpoint

1. Create or update a controller in `backend/CabriThon.Api/Controllers/`
2. Add necessary DTOs in `backend/CabriThon.Core/DTOs/`
3. Update repository interfaces and implementations in `backend/CabriThon.Infrastructure/Repositories/`
4. Test the endpoint using Swagger UI at `https://localhost:5001/swagger`

#### Backend Code Style

- Use **C# 11** features where appropriate
- Follow **Microsoft C# Coding Conventions**
- Use **async/await** for all I/O operations
- Implement proper **error handling** with try-catch blocks
- Add **XML documentation comments** for public APIs

Example:
```csharp
/// <summary>
/// Gets all active products from the catalog
/// </summary>
/// <returns>List of active products</returns>
[HttpGet("products")]
public async Task<IActionResult> GetProducts()
{
    try
    {
        var products = await _productRepository.GetAllActiveProductsAsync();
        return Ok(products);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error retrieving products");
        return StatusCode(500, new { message = "Error retrieving products" });
    }
}
```

### Frontend Development

#### Running the App

```bash
cd frontend
npm start
```

#### Adding a New Component

1. Create component file in appropriate directory:
   - `src/components/` for reusable components
   - `src/modules/` for feature-specific components
2. Create corresponding CSS file
3. Export from component file
4. Import and use in parent component

#### Frontend Code Style

- Use **TypeScript** for all new files
- Use **functional components** with hooks
- Follow **React best practices**:
  - One component per file
  - Use meaningful component and prop names
  - Implement proper prop types with TypeScript interfaces
  - Use custom hooks for reusable logic

Example:
```typescript
import React, { useState, useEffect } from 'react';
import './MyComponent.css';

interface MyComponentProps {
  title: string;
  onAction: () => void;
}

const MyComponent: React.FC<MyComponentProps> = ({ title, onAction }) => {
  const [data, setData] = useState<string[]>([]);

  useEffect(() => {
    // Fetch data
  }, []);

  return (
    <div className="my-component">
      <h2>{title}</h2>
      <button onClick={onAction}>Action</button>
    </div>
  );
};

export default MyComponent;
```

### Database Changes

#### Schema Modifications

1. Create a new SQL migration file in `database/` directory
2. Name it with incremental number: `03_your_change.sql`
3. Document the change in comments
4. Test locally before committing

#### Example Migration

```sql
-- Migration 03: Add product categories table
-- Date: 2025-01-15
-- Author: Your Name

CREATE TABLE IF NOT EXISTS product_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key to products table
ALTER TABLE products 
ADD COLUMN category_id UUID REFERENCES product_categories(id);

-- Create index
CREATE INDEX idx_products_category_id ON products(category_id);
```

## Coding Standards

### General Principles

1. **Keep it Simple** - Prefer simple, readable code over clever solutions
2. **DRY (Don't Repeat Yourself)** - Extract common logic into reusable functions
3. **SOLID Principles** - Follow object-oriented design principles
4. **Meaningful Names** - Use descriptive names for variables, functions, and classes
5. **Comments** - Comment why, not what (code should be self-explanatory)

### Formatting

#### Backend (.NET)
- Indentation: 4 spaces
- Line length: Max 120 characters
- Braces: Opening brace on new line (Allman style)

#### Frontend (React/TypeScript)
- Indentation: 2 spaces
- Line length: Max 100 characters
- Braces: Opening brace on same line
- Use single quotes for strings
- Semicolons: Required

### Naming Conventions

#### Backend
- Classes: `PascalCase`
- Methods: `PascalCase`
- Parameters: `camelCase`
- Private fields: `_camelCase`
- Constants: `PascalCase`

#### Frontend
- Components: `PascalCase`
- Functions: `camelCase`
- Variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- CSS classes: `kebab-case`

### Accessibility

All frontend changes must maintain **WCAG 2.1 AA** compliance:

- Use semantic HTML elements
- Provide alt text for images
- Ensure sufficient color contrast
- Support keyboard navigation
- Use ARIA labels where needed
- Test with screen readers

Example:
```tsx
<button
  className="btn btn-primary"
  onClick={handleClick}
  aria-label="Add product to cart"
  disabled={isLoading}
>
  Add to Cart
</button>
```

## Testing Guidelines

### Backend Testing

```bash
cd backend
dotnet test
```

Write tests for:
- API endpoints (integration tests)
- Business logic (unit tests)
- Repository methods (unit tests with mocked database)

### Frontend Testing

```bash
cd frontend
npm test
```

Write tests for:
- Components (React Testing Library)
- Utility functions
- API service methods
- Custom hooks

### Manual Testing Checklist

Before submitting a PR, test:

- [ ] Backend API endpoints work correctly
- [ ] Frontend displays data properly
- [ ] Authentication and authorization work
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Accessibility features
- [ ] Error handling and edge cases
- [ ] Cross-browser compatibility (Chrome, Firefox, Safari)

## Submitting Changes

### Commit Messages

Use clear, descriptive commit messages following this format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, no logic change)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks

Examples:
```
feat(api): add endpoint for product search

Implemented new /api/public/products/search endpoint that allows
searching products by name, SKU, or category.

Closes #123
```

```
fix(frontend): resolve cart quantity update bug

Fixed issue where cart quantity wasn't updating correctly when
users clicked the increment button multiple times quickly.

Fixes #456
```

### Pull Request Process

1. **Update your branch** with latest changes from upstream:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run tests** and ensure all pass

3. **Lint your code**:
   ```bash
   # Backend
   dotnet format
   
   # Frontend
   npm run lint
   ```

4. **Push your branch**:
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create Pull Request** on GitHub:
   - Use a clear, descriptive title
   - Reference related issues
   - Describe what changed and why
   - Add screenshots for UI changes
   - List any breaking changes

6. **Code Review**:
   - Address reviewer feedback
   - Push additional commits to the same branch
   - Request re-review when ready

7. **Merge**:
   - Maintainer will merge once approved
   - Delete your branch after merge

### Pull Request Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #(issue number)

## Screenshots
(if applicable)

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] Tested on multiple browsers
- [ ] Tested responsive design

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally
```

## Reporting Issues

### Bug Reports

When reporting bugs, please include:

1. **Clear title** - Describe the bug concisely
2. **Environment** - OS, browser, .NET version, Node version
3. **Steps to reproduce** - Detailed steps to recreate the issue
4. **Expected behavior** - What should happen
5. **Actual behavior** - What actually happens
6. **Screenshots** - If applicable
7. **Error messages** - Console logs, stack traces
8. **Additional context** - Any other relevant information

### Feature Requests

When requesting features, please include:

1. **Problem description** - What problem does this solve?
2. **Proposed solution** - How should it work?
3. **Alternatives considered** - Other approaches you've thought of
4. **Use cases** - Real-world scenarios where this would be useful

### Security Issues

**DO NOT** create public issues for security vulnerabilities.

Instead, email security concerns to: [security@example.com]

## Development Tips

### Debugging Backend

1. Use Visual Studio or VS Code debugger
2. Add breakpoints in controllers and repositories
3. Check Swagger UI for API documentation and testing
4. Review logs in console output

### Debugging Frontend

1. Use React Developer Tools browser extension
2. Use browser DevTools console and Network tab
3. Add console.log statements for data inspection
4. Use Redux DevTools (if Redux is added in future)

### Common Issues

**Issue**: CORS errors
- **Solution**: Ensure frontend URL is in backend CORS policy

**Issue**: 401 Unauthorized on protected endpoints
- **Solution**: Check that token is being sent and is valid

**Issue**: RLS blocking database queries
- **Solution**: Verify using service role key in backend

**Issue**: Firebase auth errors
- **Solution**: Check Firebase config in .env matches your project

## Questions?

- Review existing documentation in the repository
- Search existing issues and pull requests
- Ask questions in issue discussions
- Contact maintainers

Thank you for contributing to CabriThon! 🎉

