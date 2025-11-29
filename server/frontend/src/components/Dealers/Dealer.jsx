import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import "./Dealers.css";
import "../assets/style.css";
import positive_icon from "../assets/positive.png"
import neutral_icon from "../assets/neutral.png"
import negative_icon from "../assets/negative.png"
import review_icon from "../assets/reviewbutton.png"
import Header from '../Header/Header';

const Dealer = () => {
  // 1. State variables
  const [dealer, setDealer] = useState(null); 
  const [reviews, setReviews] = useState([]);
  const [unreviewed, setUnreviewed] = useState(false);
  const [postReview, setPostReview] = useState(<></>)

  const params = useParams();
  const id = params.id;

  const dealer_url = `/djangoapp/dealer/${id}`;
  const reviews_url = `/djangoapp/dealer/${id}/reviews`;
  const post_review = `/postreview/${id}`;

  const get_dealer = async () => {
    const res = await fetch(dealer_url, { method: "GET" });
    const retobj = await res.json();

    if (retobj.status === 200 && retobj.dealer) {
      setDealer(retobj.dealer)
    } else {
      setDealer({}); 
    }
  }

  const get_reviews = async () => {
    const res = await fetch(reviews_url, { method: "GET" });
    const retobj = await res.json();

    if (retobj.status === 200 && retobj.reviews) {
      if (retobj.reviews.length > 0) {
        setReviews(retobj.reviews)
      } else {
        setUnreviewed(true);
      }
    } else {
      setUnreviewed(true);
    }
  }

  const senti_icon = (sentiment) => {
    let icon = sentiment === "positive" ? positive_icon : sentiment === "negative" ? negative_icon : neutral_icon;
    return icon;
  }

  // 3. useEffect Hook
  useEffect(() => {
    get_dealer();
    get_reviews();
    if (sessionStorage.getItem("username")) {
      setPostReview(<a href={post_review}><img src={review_icon} style={{ width: '10%', marginLeft: '10px', marginTop: '10px' }} alt='Post Review' /></a>)
    }
  }, [id]);

  if (dealer === null) {
    return <div>Loading Dealer Details...</div>; 
  }

  if (Object.keys(dealer).length === 0) {
    return <div>Dealer not found. Please check the ID.</div>;
  }

  return (
    <div style={{ margin: "20px" }}>
      <Header />
      <div style={{ marginTop: "10px", display: "flex", alignItems: "center" }}>
        <h1 style={{ color: "grey" }}>{dealer.full_name}{postReview}</h1>
      </div>
      <h4 style={{ color: "grey" }}>{dealer.city}, {dealer.address}, Zip - {dealer.zip}, {dealer.state} </h4>

      <div class="reviews_panel" style={{ marginTop: "30px" }}>
        {reviews.length === 0 && unreviewed === false ? (
          <text>Loading Reviews....</text>
        ) : unreviewed === true ? (
          <div>No reviews yet! {postReview}</div>
        ) : (
          reviews.map(review => (
            <div className='review_panel' key={review._id || review.id} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '15px', marginBottom: '10px' }}>
              <img src={senti_icon(review.sentiment)} className="emotion_icon" alt='Sentiment' style={{ width: '30px', float: 'left', marginRight: '10px' }} />
              <div className='review'>{review.review}</div>
              <div className="reviewer" style={{ marginTop: '10px', fontSize: '0.9em', color: '#666' }}>
                {review.name} {review.car_make} {review.car_model} {review.car_year}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Dealer