## Installation

Node.js runtime environment is required.
Clone the repo and execute the following command:
	
	sudo npm link 

## Usage

### Setup your account

	wizard login --help
	
	Options:
    -l, --username [username]  username
    -p, --password [password]  password
    -e, --env [env]            environment {alpha|beta|pre|product}, 	default to alpha
	
example:
	
	wizard login -l name -p password -e alpha
	
### Add Configuration

	wizard config --help
	
	Options:
    -g, --git [git]          git repo
    -d, --baseDir [baseDir]  the baseDir to search from
	
example:
	
	wizard config -g http://code.dianpingoa.com/apple/shop-web
	
### Sync a module from remote repo to server

	wizard sync --help
	
	Options:
    -n, --name [name]        name of the module to commit
    -m, --comment [comment]  your comment
    -b, --branch [branch]    git repo branch
    -e, --env [env]          which environment to commit {alpha|beta|pre|product}
	
example: sync the promo module on branch "feature" to alpha server 
	
	wizard sync -n promo -m comment -b feature -e alpha

### Preview a module

	wizard preview --help
	
	Options:
    -n, --name [name]      name of the module to preview
    -s, --shopId [shopId]  shopId
    -e, --env [env]        which environment {alpha|beta|pre|product}
	
example: preview promo module in alpha environment
	
	wizard preview -n promo -s 500447 -e alpha