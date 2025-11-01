# Contributing to Universal Prompt Generator Pro

Thank you for your interest in contributing to Universal Prompt Generator Pro! This document provides guidelines and instructions for contributing.

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
   ```bash
   git clone https://github.com/YOUR_USERNAME/UniPromptGen2.git
   cd UniPromptGen2
   ```
3. **Install dependencies**
   ```bash
   npm install
   ```
4. **Create a branch** for your changes
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 💻 Development Workflow

### Code Style

- Follow the existing code style and conventions
- Use TypeScript for type safety
- Write meaningful variable and function names
- Add comments for complex logic

### Testing Your Changes

1. **Run the development server**
   ```bash
   npm run dev
   ```

2. **Test your changes** thoroughly in the browser at http://localhost:3000

3. **Build the project** to ensure no build errors
   ```bash
   npm run build
   ```

4. **Check TypeScript types**
   ```bash
   npx tsc --noEmit
   ```

### Commit Guidelines

- Write clear, descriptive commit messages
- Use present tense ("Add feature" not "Added feature")
- Reference issue numbers when applicable
- Keep commits focused and atomic

Example:
```
Add temperature control to model configuration

- Add temperature slider to ModelNodeData
- Update node configuration panel
- Add validation for temperature range (0-2)

Fixes #123
```

## 📝 Pull Request Process

1. **Update documentation** if you've changed APIs or added features
2. **Ensure all tests pass** and the project builds successfully
3. **Update the README.md** if needed
4. **Create a pull request** with a clear description of changes

### Pull Request Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested your changes

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] TypeScript compilation passes
```

## 🐛 Reporting Bugs

When reporting bugs, please include:

- **Description**: Clear description of the bug
- **Steps to Reproduce**: Detailed steps to reproduce the issue
- **Expected Behavior**: What you expected to happen
- **Actual Behavior**: What actually happened
- **Environment**: Browser, OS, Node.js version
- **Screenshots**: If applicable

## 💡 Feature Requests

We welcome feature requests! Please include:

- **Use case**: Why this feature would be useful
- **Proposed solution**: How you envision it working
- **Alternatives considered**: Other approaches you've thought about

## 🎯 Areas for Contribution

Here are some areas where contributions are especially welcome:

- **UI/UX improvements**: Enhance the user interface and experience
- **Performance optimizations**: Improve load times and responsiveness
- **Documentation**: Improve docs, add examples, fix typos
- **Bug fixes**: Fix reported issues
- **New features**: Implement features from the roadmap
- **Testing**: Add unit tests, integration tests
- **Accessibility**: Improve keyboard navigation, screen reader support

## 📚 Resources

- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev/)
- [Gemini API Documentation](https://ai.google.dev/gemini-api/docs)

## ❓ Questions?

If you have questions, feel free to:
- Open an issue with the "question" label
- Reach out to the maintainers

## 📜 Code of Conduct

Please be respectful and professional in all interactions. We're here to collaborate and build something great together!

---

Thank you for contributing to Universal Prompt Generator Pro! 🎉
