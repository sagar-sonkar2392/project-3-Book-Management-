const express = require("express")
const router = express.Router()
const userController= require("../controllers/userController")
const bookControllers =require("../controllers/bookController")






//========== post api users===========================
router.post("/register", userController.registerUser)

//============login api================
router.post("/login", userController.login)

// =================getbook api=============//
router.get("/books",bookControllers.getBook)
 
//=========================== if the endpoint are correct or not ==========================================
router.all("*", function (req, res) {
    res.status(404).send({
        status: false,
        message: "The Path you are requesting is not available !!"
    })
})

module.exports = router