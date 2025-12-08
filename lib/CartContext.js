import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
    const [cart, setCart] = useState({})
    const [isLoaded, setIsLoaded] = useState(false)
    const [user, setUserUser] = useState(null)

    // Helper to get cart key
    const getCartKey = (u) => `terramar_cart_${u ? u.id : 'guest'}`

    useEffect(() => {
        // Check for logged in user
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
            setUserUser(JSON.parse(storedUser))
        }
    }, [])

    useEffect(() => {
        // Load cart whenever user changes
        const key = getCartKey(user)
        const saved = localStorage.getItem(key)
        if (saved) {
            try {
                setCart(JSON.parse(saved))
            } catch (e) {
                console.error('Failed to parse cart', e)
                setCart({})
            }
        } else {
            setCart({})
        }
        setIsLoaded(true)
    }, [user])

    useEffect(() => {
        if (isLoaded) {
            const key = getCartKey(user)
            localStorage.setItem(key, JSON.stringify(cart))
        }
    }, [cart, isLoaded, user])

    const loginUser = (userData) => {
        setUserUser(userData)
    }

    const logoutUser = () => {
        setUserUser(null)
    }

    const addToCart = (product) => {
        setCart((prev) => {
            const colId = product._id || product.key
            const existing = prev[colId]
            if (existing) {
                return {
                    ...prev,
                    [colId]: {
                        ...existing,
                        quantity: existing.quantity + 1,
                        // Update price if it changed (e.g. region switch)
                        price: product.price || existing.price,
                        originalPrice: product.originalPrice || existing.originalPrice
                    }
                }
            }
            return {
                ...prev,
                [colId]: { ...product, _id: colId, quantity: 1 }
            }
        })
    }

    const removeFromCart = (productId) => {
        setCart((prev) => {
            const existing = prev[productId]
            if (!existing) return prev

            if (existing.quantity > 1) {
                return {
                    ...prev,
                    [productId]: { ...existing, quantity: existing.quantity - 1 }
                }
            }

            const newCart = { ...prev }
            delete newCart[productId]
            return newCart
        })
    }

    const updateQuantity = (productId, qty) => {
        setCart((prev) => {
            if (qty <= 0) {
                const newCart = { ...prev }
                delete newCart[productId]
                return newCart
            }
            const existing = prev[productId]
            if (!existing) return prev

            return {
                ...prev,
                [productId]: { ...existing, quantity: qty }
            }
        })
    }

    const clearCart = () => {
        setCart({})
    }

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, loginUser, logoutUser, user }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    return useContext(CartContext)
}
