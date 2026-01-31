Refactor notes:

- UI components moved under `./ui/<ComponentName>/<ComponentName>.jsx` and exported from `./ui/index.js`.
- Use `import { Input, Button, Loading, Card, Table, Upload } from '../components';` or import directly `import Input from '../components/ui/Input/Input';`.
- Feature-specific components remain under their own folders.

Recommendation: gradually migrate feature imports to barrels (`components/index.js`) to improve readability.