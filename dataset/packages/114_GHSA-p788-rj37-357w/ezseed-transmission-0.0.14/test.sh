USERNAME='user'
PASSWORD='test'
USER_HOME='/home'
cat test.json | jq '.["incomplete-dir-enabled"]=true | .["incomplete-dir"]="'$USER_HOME'/incomplete" | .["download-dir"]="'$USER_HOME'/downloads" | .["peer-port-random-on-start"]=true | .["lpd-enabled"]=true | .["peer-socket-tos"]="lowcost" | .["rpc-password"]="'$PASSWORD'" | .["rpc-enabled"]=true | .["rpc-whitelist-enabled"]=false | .["rpc-authentication-required"]=true | .["rpc-username"]="'$USERNAME'"' > test2.json 

