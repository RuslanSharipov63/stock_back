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


const PORT = 8000;
const app = express();
app.use(cors())
app.use(fileUpload());
app.use(express.json());
app.get('/', async (req, res) => {
    try {
        const data = await selectDb('data');
        res.send(JSON.stringify(data))
        res.end();
    } catch (error) {
        console.log(error.stack)
        res.json({ message: false })
        res.end();
    }

})

app.post('/add', (req, res) => {

    const fileName = req.files.file.name;
    /*  const fileForDB = `water_${fileName}`; */
    const tags = req.body.tags;
    const autor_id = req.body.id;


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
    /*  try { */
    const fileName = req.params.filename;
    console.log(fileName)
    const fileLocation = path.join(__dirname + '/img/', fileName); /* путь к файлу */
    const expansionArr = fileLocation.split('.') /* массив из пути делаем с разделением по точке */
    const expansion = expansionArr[expansionArr.length - 1];/* вытаскиваем последнее значение это наше расширение*/
    /* копируем файл */
    /*  fs.copyFile(fileLocation, path.join('./download/', 'stok' + '.' + expansion), err => {
         if (err) {
             console.log(err)
         };
     }); */
    /*     res.setHeader('Content-disposition', 'attachment; filename=stok.' + expansion); */
    /* let kj = path.join(__dirname + '/download/', 'stok.' + expansion) */
    console.log(fileLocation)
    res.send(JSON.stringify({path: fileLocation}))
    res.end();

    /* , (err) => { */
    /*  if (err) {
         res.status(404)
         console.log('download failed');
         console.error(err);
         res.end();

     } else {
         console.log('downloaded seccefully');
         res.send(JSON.stringify({ message: true }))
         res.end();

     }
 } *//* ); */
    /*  } catch (error) {
         console.log(error.stack)
         res.send(JSON.stringify({ message: false }))
 
 
     }*/
})

app.listen(PORT, (err) => {
    if (err) {
        console.log(err)
    } else {
        console.log(`Server work port ${PORT}`)
    }
})
