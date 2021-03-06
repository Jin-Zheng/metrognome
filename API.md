# Metro-Gnome REST API Documentation

## File API

- Description: save a file to the database
- Request: `POST /file/`
- Response: 200
    - Redirect: `/`
- Example:
```
curl http://localhost:3000/
```

- Description: get a file from the database
- Request: `GET /file/:filename`
- Response: 200
    - content-type: file.mimetype
    - object:
        - file
        - file metadata
- Response: 404
    - body: "error"
- Response: 500
    - body: error log
- Example:
```
curl http://localhost:3000/
```

- Description: get all files from the database for the authenticated user
- Request: `GET /file/`
- Response: 200
    - list of objects:
        - file
        - file metadata
- Response: 404
    - body: "error"
- Response: 500
    - body: error log
- Example:
```
curl http://localhost:3000/
```

- Description: delete a file from the database
- Request: `DELETE /file/:filename`
- Response: 200
    - file deleted
- Response: 404
    - body: "file not found"
- Example:
```
curl http://localhost:3000/
```

## User API

- Description: Facebook authentication strategy
- Request: `GET /auth/facebook/`
- Response: 200
- Example:
```
curl https://metro-gnome.me/auth/facebook/
```

- Description: Facebook authentication callback. send cookie with facebookID
- Request: `GET /auth/facebook/callback`
- Response: 200
    - body: string
        - facebookID: (string) facebookID for user
- Example:
```
curl https://metro-gnome.me/auth/facebook/callback
```

- Description: Get user info
- Request: `GET /users/info/`
- Response: 200
    - content-type: `application/json`
    - body: object
        -_id: user id
        -firstName: (string) first name of user
        -lastName: (string) last name of user
        -email: (string) email of user
        -facebookID: (string) facebook id of user if it is a facebook account
- Response: 404
    -body: User does not exists
    -body: Facebook User does not exist
- Response: 500
    - body: error log
- Example:
```
curl -X POST
       -H "Content-Type: `application/json`"
       -d {"username": "alice", "password": "password"}
       http://localhost:3000/signin/
curl -X GET
       -H "Content-Type: `application/json`"
       http://localhost:3000/users/info/
```

- Description: Update user info
- Request: `PUT /users/info/`
    - content-type: application/json
    - body: object
        - firstName: (string) new first name of user
        - lastName: (string) new last name of user
        - password: (string) new password of user
        - email: (string) new email of user
- Response: 200
    -body: User has been updated
- Response: 404
    - body: User does not exists
    - body: Facebook User does not exist
- Response: 500
    - body: error log
- Example:
```
curl -X PUT
       -H "Content-Type: `application/json`"
       -d {"username": "alice", "firstName": "alice", "lastName":"alice", "email":"123@hotmail.com", "password":"newPass"}
       http://localhost:3000/users/info/
```

- Description: Checks whether the password supplied is the current user's hashed password
- Request: `POST /users/passCheck/`
    - content-type: application/json
    - body: object
        password: (string) old password that user has entered
- Response: 200
    -body: boolean
        -body: true
        -body: false
- Response: 404
    - body: User does not exists
    - body: Facebook User does not exists

- Response: 500
    - body: error log
- Example:
```
curl -X POST
       -H "Content-Type: `application/json`"
       -d {"username": "alice", "password": "password"}
       http://localhost:3000/signup/
```curl -X POST
       -H "Content-Type: `application/json`"
       -d {"password": "password"}
       http://localhost:3000/users/passCheck/
```

- Description: Sign up as a new user
- Request: `POST /signup/`
    - content-type: `application/json`
    - body: object
        - username: (string) the username
        - password: (string) the password
- Response: 200
    - body: user username has signed up
- Response: 409
    - body: username username already exists
- Response: 500
    - body: error log
- Example:
```curl -X POST
       -H "Content-Type: `application/json`"
       -d {"username": "alice", "password": "password"}
       http://localhost:3000/signup/
```

- Description: Sign in as an existing user
- Request: `POST /signup/`
    - content-type: `application/json`
    - body: object
        - username: (string) the username
        - password: (string) the password
- Response: 200
    - body: user username has signed in
- Response: 401
    - body: access denied
- Response: 500
    - body: error log
- Example:
```curl -X POST
       -H "Content-Type: `application/json`"
       -d {"username": "alice", "password": "password"}
       http://localhost:3000/signin/
```

- Description: Sign out of the app
- Request: `GET /signout/`
- Response: 200
    - redirect: `localhost:3000/`
- Example:
```
curl http://localhost:3000/signout/
```

## Beats API

- Description: save a new beat into the database
- Request: `POST /beat/`
    - content-type: `application/json`
    - body: object
        - beatSequence: (object) the state of the sequencer
        - tempo: (int) the tempo of the beat
        - publicBool: (boolean) True if the beat is public
        - title: (String) the title of the beat
        - desc: (String) short description of the beat
- Response: 200
    - content-type: `application/json`
    - body: object
        - the beat that was saved
- Response: 401
    - body: access denied.
- Response: 500
    - body: error log
- Example:
```
curl -X POST
        -H "Content-Type: `application/json`"
        -F "title=Mona Lisa"
        -F "file=@/home/user/Desktop/MonaLisa.jpg"
        http://localhost:3000/api/images/
```

- Description: get all private beats of the authenticated user
- Request: `GET /beats/private/`
- Response: 200
    - list of beats objects
- Response: 401
    - body: access denied.
- Response: 404
    - body: "No private beats found for user"
- Response: 500
    - body: error log
- Example:
```
curl http://localhost:3000/api/images/jf01928jdsuhgzuhq/image
```

- Description: get all public beats of the authenticated user
- Request: `GET /beats/public/popular/`
- Response: 200
    - list of beats objects
- Response: 401
    - body: access denied.
- Response: 404
    - body: "No public beats found"
- Response: 500
    - body: error log
- Example:
```
curl http://localhost:3000/api/images/jf01928jdsuhgzuhq/image
```

- Description: get a beat by its id
- Request: `GET /beat/:id/`
- Response: 200
    - content-type: `application/json`
    - body: beat object
- Response: 401
    - body: access denied.
- Response: 404
    - body: Beat with that id doesn't exist
- Response: 500
    - body: error log
- Example:
```
curl http://localhost:3000/api/images/jf01928jdsuhgzuhq
```

- Description: Delete all comments for an image
- Request: `PATCH /beat/upvote/:id/`
- Response: 200
- Response: 401
    - body: access denied.
- Example:
```
curl -X DELETE
        http://localhost:3000/api/images/jf01928jdsuhgzuhq/comments
```

- Description: delete a beat by its id
- Request: `DELETE /beat/:id/`
- Response: 200
    - content-type: `application/json`
    - body: beat object deleted
- Response: 401
    - body: access denied.
- Response: 404
    - body: "Beat id not found"
- Example:
```
curl -X DELETE
        http://localhost:3000/api/images/jf01928jdsuhgzuhq
```

## Comment API

- Description: post a comment 
- Request: `POST /comment/`
    - content-type: `application/json`
    - body: object
        - beatId: (string) id of the beat this comment is for
        - content: (string) content of the comment
- Response: 200
    - content-type: `application/json`
    - body: object
        - _id: (string) the id of the comment
        - beatId: (string) id of the beat this comment is for
        - content: (string) content of the comment
        - username: (string) author of the comment
        - facebookID: (string) facebookId of author
- Response: 401
    - body: access denied.
- Response: 500
    - body: error log
- Example:
```curl -X POST
        -H "Content-Type: `application/json`"
        -d {"imageId": "jf01928jdsuhgzuhq", "content": "Great Pic!"}
        http://localhost:3000/api/comments/
```

- Description: get comments for a given beatId
- Request: `GET /comments/:id/`
- Response: 200
    - content-type: `application/json`
    - body: object
        - _id: (string) the id of the comment
        - beatId: (string) id of the beat this comment is for
        - content: (string) content of the comment
        - username: (string) author of the comment
        - facebookID: (string) facebookId of author
- Response: 401
    - body: access denied.
- Response: 404
    - body: comment id not found
- Response: 500
    - body: error log
- Example:
```
curl http://localhost:3000/api/comments/jf01928jdsuhgzuhq/?page=2/
```

- Description: Delete a comment
- Request: `DELETE /comments/:id/`
- Response: 200
    - content-type: `application/json`
    - body: object
        - _id: (string) the id of the comment
        - imageId: (string) id of the image this comment is for
        - content: (string) content of the comment
        - author: (string author of the comment
        - date: (string) the date time the comment was inserted
- Response: 401
    - body: access denied.
- Response: 404
    - body: comment id not found
- Response: 500
    - body: error log
- Example:
```
curl -X DELETE
        http://localhost:3000/api/comments/jf01928jdsuhgzuhq
```
