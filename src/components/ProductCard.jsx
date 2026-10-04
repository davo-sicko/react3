import { useContext } from "react";
import { CartContext } from "./CartContext";
import { ThemeContext } from "./ThemeContext";
import { useNavigate } from "react-router-dom";

function ProductCard(props){
  const {addToCart} = useContext(CartContext);
  const {theme} = useContext(ThemeContext);
  const navigate = useNavigate();

  const buttonStyles = {
    backgroundColor: theme === "dark" ? "#444" : "#eee",
    color: theme === "dark" ? "#fff" : "#000",
    border: theme === "dark" ? "1px solid #777" : "1px solid #ccc",
    borderRadius: "5px",
    padding: "6px 12px",
    cursor: "pointer",
  };

  const handleClick = () => {
    addToCart({name: props.name, price: props.price});
    navigate("/cart");
  }
  
  return( 
      <div>
        <img src={props.img} width={250} height={250}/>
        <p>{props.name}</p>
        <p>{props.price} рублей</p>
        <button onClick={handleClick} style={buttonStyles}>Добавить в корзину</button>
      </div>
  );
}

export default ProductCard;