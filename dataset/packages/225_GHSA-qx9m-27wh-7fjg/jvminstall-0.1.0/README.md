# jvmInstall

This is simple script for installing Java Virtual Machine on local computer.
It will download package, unpack it and set correct permissions.

## Usage:

```sh
$ node jvminstall [installpath="some install path" configpath="path to config file"]
```

By defaults module install JavaVM into ("USERPROFILE" | "HOME") ".jvm" path,
but you specify it by argument:

```sh
installpath="some install path"
```

Also you can specify path to custom config file by:

```sh
configpath="path to config file"
```