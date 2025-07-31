## Managing Secrets

### `.env` file

- Create a `.env` file in the project root to store sensitive data (write values without `""`):
  ```
  AREA_ANALYTICS_ACCOUNT_NAME=your_area_analytics_account_name_here
  AREA_ANALYTICS_KEY=your_area_analytics_key_here
  ```

- Create a `.env` file in the directory with docker-compose file to store crucial database connection information:
  ```
  POSTGRES_DB=your_database_name_here
  POSTGRES_USER=your_postgres_username_here
  POSTGRES_PASSWORD=your_postgres_password_here
  ```

## Code formatting

### Ktfmt

This project uses **Ktfmt (kotlinlang style)** for code formatting. 

Run `mvn spotless:check` to verify formatting or `mvn spotless:apply` to apply formatting, both limited to files changed since the origin/master branch.

IntelliJ users can also install the ktfmt plugin to simplify code formatting within the IDE. 
Make sure to set the style to kotlinlang in the plugin settings.

## Commit and Branch Naming Conventions

### Commit Messages
Use the following format for commit messages:
<type>: [AD-<task number>] <short description of the change>
where:
- `AD` stands for the **Anomaly Detection** project,
- `<task number>` is the project task ID,
- `<short description of the change>` briefly summarizes the update.

Example:
feat: [AD-001] added GIF generation

### Branch Names
Branches should be named using this pattern:
ad-<task number>-<short-feature-name>
where:
- `ad` (lowercase) refers to **Anomaly Detection**,
- `<task number>` is the task ID,
- `<short-feature-name>` describes the feature or work done on the branch, using hyphens to separate words.

Example:
ad-001-visualisation