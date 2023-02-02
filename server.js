const express = require('express');
const selectDb = require('./models/selectdb')
const fileUpload = require('express-fileupload');
const cors = require('cors')
const path = require('path')
const fs = require('fs')
const Jimp = require('jimp');
const insertSql = require('./models/insertdb')
const insertDbUsers = require('./models/insertDbUsers');
const selectDbId = require('./models/selectDbId')
const selectDbAuthorId = require('./models/selectDbAuthorId')
const deleteDbId = require('./models/deleteDbId');
const bcrypt = require('bcryptjs');
const generateAccessToken = require('./controller/Auth')
const authMiddleware = require('./middleware/Middleware')


const PORT = 8000;
const app = express();
app.use(cors())
app.use(fileUpload());
app.use(express.json());
app.get('/', async (req, res) => {
    const data = await selectDb('data');
    res.send(JSON.stringify(data))
    res.end();
})

app.post('/add', (req, res) => {

    const fileName = req.files.file.name;
    const fileForDB = `water_${fileName}`;
    const tags = req.body.tags;
    const autor_id = req.body.id;

    /* const logoImg = async () => { */
    req.files.file.mv(path.join(__dirname, 'img', req.files.file.name), async function (err) {
        if (err) {
            res.send('Файл не загружен')
            res.end()
        } else {
            /*   let a = path.join(__dirname, 'img', req.files.file.name);
              let b = path.join(__dirname, 'waterlogo.png')
              Promise.all([
                  Jimp.read(a),
                  Jimp.read(b),
              ])
                  .then(function (results) {
                      results[0].composite(results[1], 50, 30)
                          .write(path.join(__dirname, 'imgwater', 'water_' + req.files.file.name));
                  })
                  .catch(function (err) {
                      console.error(err);
                  }) */
            let rows = await insertSql(autor_id, fileName, tags);
            res.send(JSON.stringify(rows))
            res.end();
        }
    })
    /*  }
 logoImg ()*/
})


app.post('/Registration', async (req, res) => {
    const users = await selectDb('users');

    try {
        const isEmail = await users.find(item => item.email === req.body.email)

        if (isEmail) {
            return res.json({ message: 'Пользователь с таким email существует', code: 1 })
        }
        const { name, email, password } = req.body;
        const hashPassword = await bcrypt.hash(password, 10);
        insertDbUsers(name, email, hashPassword)
        return res.json({ message: 'Пользователь зарегестрирован', code: 2 })
    } catch (error) {
        res.json({ message: 'Отмена регистрации. Попробуйте еще раз' })
    }
})

let userId = ''

app.post('/Auth', async (req, res) => {
    const users = await selectDb('users');
    const isEmail = await users.find(item => item.email === req.body.email);
    try {
        if (!isEmail) {
            return res.json({ message: 'Данные введены некорректно', code: 1 })
        }
        const validPassword = await bcrypt.compare(req.body.password, isEmail.password);

        if (!validPassword) {
            return res.json({ message: 'Данные введены некорректно', code: 2 })
        }

        const token = generateAccessToken(isEmail.id, isEmail.email);
        userId = isEmail.id;
        return res.json({ token })
        /*   if (validPassword) {
              return res.json({
                  message: true, code: 3
              })
          } */
    } catch (error) {
        res.json({ message: 'Отмена авторизации. Попробуйте еще раз' })
        console.log(error.stack)
    }
})

app.get('/jwt', authMiddleware, (req, res) => {

    try {
        return res.json({ message: 'Пользователь авторизован', id: userId })
    } catch (error) {
        console.log(error)
        return res.json({ message: 'Пользователь не авторизован' })
    }

})

app.get('/account/:id', async (req, res) => {
    const id = req.params.id

    try {
        const usersId = await selectDbId('users', id)
        const dataAuthorId = await selectDbAuthorId('data', id)
        res.send(JSON.stringify(usersId))
        res.end();

    } catch (error) {
        const messageError = 'Не удалось загрузить страницу пользователя'
        res.send(JSON.stringify(messageError))
        res.end();
    }

})

app.get('/userimg/:id', async (req, res) => {
    const id = req.params.id
    try {
        const userImg = await selectDbAuthorId('data', id)
        res.send(JSON.stringify(userImg))
        res.end();
    } catch (error) {
        const messageError = 'Не удалось загрузить страницу пользователя'
        res.send(JSON.stringify(messageError))
        res.end();
    }
})

let rowsForDelete = '';

app.get('/deletefile', (req, res) => {

    fs.unlink(path.join(__dirname, 'img', rowsForDelete[0].img_original_big), (err) => {
        if (err) throw err;
        console.log('Deleted');
    });
    res.end();

})

app.get('/delete/:id', async (req, res) => {
    const id = await req.params.id;
    try {
        rowsForDelete = await selectDbId('data', id);
        let author_id = rowsForDelete[0].author_id;
        const rowsDel = await deleteDbId('data', id, author_id);
        if (rowsDel.length > 0) {
            return res.send(JSON.stringify(rowsDel))
        } else {
            return res.json([])
        }

    } catch (error) {
        console.log(error)
        return res.json({ message: 'Ошибка. Попробуйте еще раз' })
    }
})




app.listen(PORT, (err) => {
    if (err) {
        console.log(err)
    } else {
        console.log(`Server work port ${PORT}`)
    }
})
