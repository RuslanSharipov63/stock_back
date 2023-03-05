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
const selectImgForAuthorId = require('./models/selectImgForAuthorId');
const selectImgForAccount = require('./models/selectImgForAccount')
const regExtension = require('./middleware/RegExtension');
const rowsImgDb = require('./middleware/rowsImgDb');
const allRowsDB = require('./middleware/allRowsDB')
const rowsVideoDb = require('./middleware/rowsVideoDb');

const PORT = 8000;
const app = express();
app.use(cors())
app.use(fileUpload());
app.use(express.json());

let countOffset = 0;

app.get('/', async (req, res) => {

    try {
        const data = await selectDb('data', countOffset);
        res.send(JSON.stringify(data))
        res.end();
    } catch (error) {
        console.log(error.stack)
        res.end();
    }

})

app.post('/add', (req, res) => {

    const fileName = req.files.file.name;
    /*  const fileForDB = `water_${fileName}`; */
    const tags = req.body.tags;
    const autor_id = req.body.id;
    const size = req.body.size;
    console.log(size)
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
            let rows = await insertSql(autor_id, fileName, tags, size);
            res.send(JSON.stringify(rows))
            res.end();
        }
    })

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
        const dataAuthorId = await selectImgForAccount('data', id)
        res.send(JSON.stringify(usersId))
        res.end();

    } catch (error) {
        const messageError = 'Не удалось загрузить страницу пользователя'
        res.send(JSON.stringify(messageError))
        res.end();
    }

})

app.get('/userimg/:id', async (req, res) => {
    const id = await req.params.id
    console.log(id)
    try {
        const userImg = await selectImgForAccount('data', id)
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

/* выводим одну картинку  */
app.get('/itempage/:id', async (req, res) => {
    const id = await req.params.id;
    const imgForId = await selectDbId('data', id);
    res.send(JSON.stringify(imgForId))
    res.end();
})

/* выводим автора для страницы с одной картинкой */
app.get('/author/:id', async (req, res) => {
    const id = await req.params.id;
    try {
        const imgForId = await selectDbId('data', id);
        const imgForIdJson = await JSON.stringify(imgForId);
        const imgForIdParse = await JSON.parse(imgForIdJson);
        let a = await imgForIdParse[0].author_id;
        const author = await selectDbAuthorId('users', a);

        res.send(JSON.stringify(
            [{ name: author[0].name }]
        ))
        res.end();
    } catch (error) {
        console.log(error);
        res.send(JSON.stringify({ message: false }))
        res.end();
    }
})

/* выводим картинки автора для страницы с одной картинкой */

app.get('/authorimg/:id', async (req, res) => {
    const id = await req.params.id;
    try {
        const imgForId = await selectDbId('data', id); /* вытаскиваем картинку по id */
        const authorId = await imgForId[0].author_id; /* из этой строки вытаскиваем id автора  */
        const imgAuthorId = await selectImgForAuthorId('data', authorId)
        res.send(JSON.stringify(imgAuthorId))
        res.end();
    } catch (error) {
        console.log(error);
        res.send(JSON.stringify({ message: 'Ошибка соединения' }))
        res.end();
    }
})

/* выводим данные на основании поиска */
app.get('/searchpage/:search', async (req, res) => {
    const search = await req.params.search;
    try {
        const datasearch = await selectDb('data');
        const datafilter = await datasearch.filter(item => item.tags.toLowerCase().includes(search.toLowerCase()));
        res.send(JSON.stringify(datafilter));
        res.end()

    } catch (error) {
        console.log(error)
        res.send(JSON.stringify({ message: 'Ошибка выборки из базы данных' }))
        res.end();
    }

})

/* роут для скачивания файла */
app.get('/download/:filename', (req, res) => {
    try {
        const fileName = req.params.filename;
        const fileLocation = path.join(__dirname + '/img/', fileName); /* путь к файлу */
        res.download(fileLocation, (error) => {
            if (error) console.log(error)
        })
    } catch (error) {
        console.log(error.stack)
        res.send(JSON.stringify({ message: false }))

    }
})

/* роут для вывода только картинок */
app.get('/images', async (req, res) => {
    try {
        let data = await selectDb('data', countOffset);
        const dataFilter = await data.filter(item => regExtension.test(item.img_original_big));
        res.send(JSON.stringify(dataFilter))
        res.end();

    } catch (error) {
        console.log(error.stack)
        res.send(JSON.stringify({ message: 'true' }))
        res.end();
    }
})


/* роут для вывода только видео */

app.get('/videos', async (req, res) => {
    try {
        let data = await selectDb('data', countOffset);
        const dataFilter = await data.filter(item => !regExtension.test(item.img_original_big));
        res.send(JSON.stringify(dataFilter))
        res.end();

    } catch (error) {
        console.log(error.stack)
        res.send(JSON.stringify({ message: 'true' }))
        res.end();
    }
})

/* запрос на число строк в таблице */

app.get('/rows/:param', async (req, res) => {
    let countRows = await 0
    try {
        switch (req.params.param) {
            case 'all':
                countRows = await allRowsDB();
                break;
            case 'image':
                countRows = await rowsImgDb()
                break;
            case 'video':
                countRows = await rowsVideoDb()
                break;
            default:
                countRows = await 0
        }
        res.send(JSON.stringify(countRows[0]['COUNT(*)']))
        res.end();
    } catch (error) {
        console.log(error.stack)
        res.send(JSON.stringify({ message: false }))
        res.end();
    }


})

app.get('/page/:count', async (req, res) => {
    let countParam = await +req.params.count;
    let countOffset = await countParam === 1 ? 0 : countParam * 5 - 5;
    try {
        const data = await selectDb('data', countOffset);
        res.send(JSON.stringify(data))
        res.end();
    } catch (error) {
        console.log(error.stack)
        res.end();
    }
})

app.listen(PORT, (err) => {
    if (err) {
        console.log(err)
    } else {
        console.log(`Server work port ${PORT}`)
    }
})
