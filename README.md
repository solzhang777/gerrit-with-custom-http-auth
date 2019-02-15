# gerrit-with-customer-http-auth

Regarding Gerrit's user http authentication, we can do it in a customr way? 

we can implement verification by ourselves, so that the source of user authentication information can be a database, or you can try the WebService, or other API.

The official http authentication method example uses .htpassword, here we use our own auth server

The basic idea is actually to use the reverse proxy to the httpd service. We are using nginx to provide a reverse proxy.

The specific configuration of nginx is as follows:

# gerrit server config:

```java
server {
    listen 8000;
	
    location /gerrit {
        proxy_pass  http://127.0.0.1:7000/login;
        proxy_set_header  X-Forwarded-For $remote_addr;
        proxy_set_header  Host $host;
        auth_basic "Gerrit2 Code Review";
        proxy_set_header  Authorization $http_authorization;
        auth_request /gerrit/auth;
    }

    location /gerrit/auth {
        internal;
        proxy_pass http://127.0.0.1:3000/gerrit/auth;
        proxy_pass_request_body off;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header Host $host;
        proxy_set_header Authorization $http_authorization;
        auth_basic "Gerrit2 Code Review";
    }
}
```

# auth server basic auth logic:
```typescript

const b64auth: string = (req.headers.authorization || '').split(' ')[1] || '';
const [login, password] = new Buffer(b64auth, 'base64').toString().split(':');

if (this.verifyUser(login, password)) {
    console.log(`${login} login success`);
    res.status(200).send('ok');
} else {
    console.log(`${login} login should be authenticate.`);
    res.set('WWW-Authenticate', 'Basic realm="Gerrit2 Code Review"'); // change this
    res.status(401).send('Authentication required.'); // custom message
}

```
[Here, You can view this simple complete auth server (based on expressjs)](https://github.com/solzhang777/gerrit-with-customer-http-auth/tree/master/auth-server)

verifyUser() can be implemented according to your business logic

I haven't solved Logout. I have mentioned the configuration of auth.loginUrl on the official website of Gerrit. I am not very clear about how to use this. If you have good learning resources or examples, please let me know, thank you.

