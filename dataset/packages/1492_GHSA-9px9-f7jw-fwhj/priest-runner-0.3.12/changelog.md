# v0.3.12
Add log append mode instead of replacement.
Fix log splicing error.
Add proper error logging.

# v0.3.8

Add log option and stdout logging.
Fix shell error for link support.
Add `vm.env` variables support.
Update config.set matchers rules.

# v0.3.5

Add set/get support for vm port/fs options.
Fix html output for log route.

# v0.3.2

Add `get` and `set` methods to priest shell.
Add new error handling to priest shell.

# v0.3.0

Fix some runtime bugs.
Add unix socket i/o.
Create priest shell script to control local container.

# v0.2.0

Add streaming with socket.io.
Update middleware routes.

# v0.1.8

Update cli interface: `priest [port] [dir] [options]`.
Add web route prefix option.
Add custom error and not found middlewares.

# v0.1.5

Rename `bin` option to `cmd` (with preserving support of `bin`).
Add error handler for child process to enhance stability.
Remove multiple process updated.
Add signal to stopProcess method.

# v0.1.4

Add route `/all` to list all process event closed.
Fix kill of delayed or restarting process.

# v0.1.2

Add controller version.
Add `/about` route.
Fix delay issue.

# v0.1.0

Add named process list.
Fix named process log bug with random logs.
Add delayed start.
Make child restart to ignore return code.
