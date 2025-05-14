import React, { useState } from "react";
import milkTea from '../images/real_milk.jpeg';
import thaiTea from '../images/real_thai.jpeg';
import taroTea from '../images/real_taro.jpeg';
import jasmineTea from '../images/real_jasmine.jpeg';
import lemonade from '../images/real_lemonade.jpeg';
import dotm from '../images/real_dotm.jpeg';
import logo from '../images/teanook_logo.jpg';

import "./Home.css";

const Home = () => {
    const [selectedDrink, setSelectedDrink] = useState(null);
    const [cart, setCart] = useState([]);
    const [drinkOptions, setDrinkOptions] = useState({
        sugar: "100",
        ice: "normal",
        toppings: [],
        flavors: [],
        quantity: 1,
        size: "medium"
    });

    const drinks = ["milk tea", "thai tea", "taro tea", "jasmine tea", "lemonade", "drink of the month"];
    const flavorOptions = ["strawberry", "raspberry", "peach", "mango", "passionfruit", "grapefruit", "lavender", "lychee", "coconut"];
    const levelOptions = ["0", "25", "50", "75", "100", "125"];
    const toppingOptions = ["boba", "lychee jelly", "rainbow jelly"];

    const drinkImages = {
        "milk tea": milkTea,
        "thai tea": thaiTea,
        "taro tea": taroTea,
        "jasmine tea": jasmineTea,
        "lemonade": lemonade,
        "drink of the month": dotm
    };

    const handleDrinkClick = (drink) => {
        setSelectedDrink(drink);
        setDrinkOptions({
            sugar: "100",
            ice: "normal",
            toppings: [],
            flavors: [],
            quantity: 1,
            size: "medium"
        });
    };

    const handleOptionChange = (option, value) => {
        setDrinkOptions((prev) => ({
            ...prev,
            [option]: value,
        }));
    };

    const addToCart = () => {
        const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
        const newItem = { drink: selectedDrink, options: drinkOptions };
        const updatedCart = [...currentCart, newItem];
        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        setSelectedDrink(null);
    };

    const closeModal = () => {
        setSelectedDrink(null);
    };

    const handleQuantityChange = (value) => {
        setDrinkOptions(prev => ({
            ...prev,
            quantity: Math.max(1, Math.min(10, Number(value)))
        }));
    };

    const incrementQuantity = () => {
        handleQuantityChange(drinkOptions.quantity + 1);
    };

    const decrementQuantity = () => {
        handleQuantityChange(drinkOptions.quantity - 1);
    };

    const toggleOption = (optionType, value) => {
        setDrinkOptions(prev => ({
            ...prev,
            [optionType]: prev[optionType].includes(value)
                ? prev[optionType].filter(item => item !== value)
                : [...prev[optionType], value]
        }));
    };

    const isOptionSelected = (optionType, value) => {
        return drinkOptions[optionType].includes(value);
    };

    const popularDrinks = [
        {
          name: "thai tea with coconut and boba",
          base: "thai tea"
        },
        {
          name: "milk tea with lavender",
          base: "milk tea"
        },
        {
          name: "mango lemonade with lychee",
          base: "lemonade"
        }
      ];
      
    return (
        <div className="container">
             <img src = {logo} alt='Teanook Logo' style={{ height: '   200px', cursor: 'pointer' }} />

            <h1 className="main-title">welcome to the tea nook pre-order platform!</h1>
            <p className="sub-title">click a drink to start customizing your perfect blend!</p>

            <h2 className="section-header">popular picks</h2>
            <div className="drink-grid">
                {popularDrinks.map(({ name, base }) => (
                    <button key={name} className="drink-button" onClick={() => handleDrinkClick(name)}>
                    <div className="drink-card">
                        <div className="drink-content">
                            <img src={drinkImages[base]} alt={name} className="drink-image" />
                            {/* <div className="drink-info"> */}
                            <p className="drink-name">{name}</p>
                            <p className="drink-subtext">a fan favorite!</p>
                            {/* </div> */}
                        </div>
                        
                    </div>
                    </button>
                ))}
            </div>

            <h2 className="section-header">all drinks</h2>
            <div className="drink-grid">
                {drinks.map((drink) => (
                    <button key={drink} className="drink-button" onClick={() => handleDrinkClick(drink)}>
                        <div className="drink-card">
                            <img src={drinkImages[drink]} alt={drink} className="drink-image" />
                            <div className="drink-info">
                                <p className="drink-name">{drink}</p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {selectedDrink && (
                <div className="modal">
                    <h2>customize your {selectedDrink}</h2>

                    {(selectedDrink === "milk tea" || selectedDrink === "jasmine tea") && (
                        <>
                            <label>sugar level:</label>
                            <select value={drinkOptions.sugar} onChange={(e) => handleOptionChange("sugar", e.target.value)}>
                                {levelOptions.map(level => (
                                    <option key={`sugar-${level}`} value={level}>{level}%</option>
                                ))}
                            </select>
                        </>
                    )}

                    <label>ice level:</label>
                    <div className="options-grid">
                        {["none", "less", "normal", "extra"].map(level => (
                            <button
                                key={level}
                                onClick={() => handleOptionChange("ice", level)}
                                className={`option-button ${drinkOptions.ice === level ? "selected" : ""}`}
                            >
                                {level.charAt(0) + level.slice(1)}
                            </button>
                        ))}
                    </div>


                    {selectedDrink !== "drink of the month" && (
                        <>
                            <label>flavors (can choose more than one):</label>
                            <div className="options-grid">
                                {flavorOptions.map(flavor => (
                                    <button
                                        key={flavor}
                                        onClick={() => toggleOption('flavors', flavor)}
                                        className={`option-button ${isOptionSelected('flavors', flavor) ? 'selected' : ''}`}
                                    >
                                        {flavor.charAt(0) + flavor.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}

                    <label>size:</label>
                    <div className="options-grid">
                        {["medium", "large"].map((size) => (
                            <button
                                key={size}
                                onClick={() => handleOptionChange('size', size)}
                                className={`option-button ${drinkOptions.size === size ? 'selected' : ''}`}
                            >
                                {size.charAt(0) + size.slice(1)}
                            </button>
                        ))}
                    </div>

                    <label>toppings (can choose more than one):</label>
                    <div className="options-grid">
                        {toppingOptions.map(topping => (
                            <button
                                key={topping}
                                onClick={() => toggleOption('toppings', topping)}
                                className={`option-button ${isOptionSelected('toppings', topping) ? 'selected' : ''}`}
                            >
                                {topping.split(' ').map(word => word.charAt(0) + word.slice(1)).join(' ')}
                            </button>
                        ))}
                    </div>

                    <label>quantity:</label>
                    <div className="quantity-controls">
                        <button onClick={decrementQuantity} disabled={drinkOptions.quantity <= 1}>-</button>
                        <input
                            type="number"
                            min="1"
                            max="10"
                            value={drinkOptions.quantity}
                            onChange={(e) => handleQuantityChange(e.target.value)}
                            style={{ width: '60px', display: 'inline-block', margin: '0 10px' }}
                        />
                        <button onClick={incrementQuantity} disabled={drinkOptions.quantity >= 10}>+</button>
                    </div>

                    <div className="modal-actions">
                        <button onClick={closeModal} className="cancel-btn">cancel</button>
                        <button onClick={addToCart} className="add-to-cart-btn">add to cart</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;