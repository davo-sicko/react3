import ProductCard from "./ProductCard";
import { useContext } from "react";
import { ThemeContext } from "./ThemeContext";

function Products(){
    const { theme } = useContext(ThemeContext);

    return(
    <div>
        <br/>
        <p style={{ fontFamily: "Verdana", color: theme === "dark" ? "white" : "black"}}>Наши продукты:</p>
        <br/>
        <div style={{display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap"}}>
            <ProductCard name="Лонгслив Suarez" price="7500" img="https://basket-32.wbbasket.ru/vol6724/part672443/672443552/images/c516x688/1.webp" />
            <ProductCard name="Лонгслив Shevchenko" price="5000" img="ссылка_на_картинку_2" />
            <ProductCard name="Футболка F.Torres" price="3000" img="ссылка_на_картинку_3" />
            <ProductCard name="Лонгслив L.Yamal" price="2000" img="ссылка_на_картинку_4" />
            <ProductCard name="Футболка Pogba" price="2500" img="ссылка_на_картинку_5" />
        </div>
    </div>
    );
}

export default Products;