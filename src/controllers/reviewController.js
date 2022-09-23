const reviewModel = require("../models/reviewModel");
const bookModel = require("../models/bookModel");
const mongoose = require("mongoose");

const isValidObjectId = function (objectId) {
  return mongoose.Types.ObjectId.isValid(objectId);
};


const checkvalidReqBody = function (resBody) {
  return Object.keys(resBody).length > 0
}

const review = async function (req, res) {
  try {
    let bookId = req.params.bookId;

    if (!isValidObjectId(bookId)) return res.status(400).send({ status: false, message: "Enter a valid book id" });

    let checkBookId = await bookModel.findById(bookId);
    if (!checkBookId)
      return res.status(404).send({ status: false, message: "Book not found" });

    if (checkBookId.isDeleted == true)
      return res.status(404).send({ status: false, message: "Book not found or might have been deleted" });

    let data = req.body;

    if (!checkvalidReqBody(data))
      return res.status(400).send({ status: false, message: "Details required to add review to book" });

    if (!data.rating)
      return res.status(400).send({ status: false, message: "Rating is required and should not be 0" });

    if (!/^[1-5]$/.test(data.rating)) {
      return res.status(400).send({ status: false, message: "Rate between 1-5" });
    }

    data.bookId = bookId;

    let reviewData = await reviewModel.create(data);
    await bookModel.updateOne({ _id: bookId }, { $inc: { reviews: 1 } });

    res.status(201).send({ status: true, message: "Success", data: reviewData });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const upadateReview = async function (req, res) {
  try {
    let bookId = req.params.bookId
    let reviewId = req.params.reviewId

    if (!isValidObjectId(bookId)) {
      return res.status(400).send({ status: false, message: "Invalid book Id" })
    }

    let bookData = await bookModel.findById(bookId)
    if (!bookData) return res.status(404).send({ status: false, message: "Book Not Found", });
    if (bookData.isDeleted == true) return res.status(400).send({ status: false, message: "Book already Deleted :( " });

    if (!isValidObjectId(reviewId)) {
      return res.status(400).send({ status: false, message: "Invalid review Id" })
    }
    let reviewData = await reviewModel.findById(reviewId)
    if (!reviewData) return res.status(404).send({ status: false, message: "Review Not Found", });
    if (bookData.isDeleted == true) return res.status(400).send({ status: false, message: "Review already Deleted :( " });

    let upadateData = req.body
    if (!checkvalidReqBody(upadateData)) {
      return res.status(400).send({ status: false, message: "Invalide Request. Please Provide Review Details" })
    }

    let { review, rating, reviewedBy } = upadateData

    if (!/^[1-5]$/.test(rating)) {
      return res.status(400).send({ status: false, message: "Rate between 1-5 or no decimal and must be number only" });
    }

    let upadate = await reviewModel.findByIdAndUpdate(
      reviewId,
      { $set: { review: review, rating: rating, reviewedBy: reviewedBy, reviewedAt: Date.now() } },
      { new: true }
    )

    res.status(200).send({ status: true, message: "success", data: upadate })

  } catch (error) {
    return res.status(500).send({ status: false, message: err.message })
  }
}


module.exports = { review, upadateReview }
