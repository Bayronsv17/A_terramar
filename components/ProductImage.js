import { useState, useMemo } from 'react'

export default function ProductImage({ product }) {
    // -1 = custom image from DB
    // 0 = primary (gray) full key
    // 1 = secondary (color) full key
    // 2 = primary (gray) base key (if applicable)
    // 3 = secondary (color) base key (if applicable)
    // 4 = placeholder

    const [imageState, setImageState] = useState(product.image ? -1 : 0)

    const baseKey = product.key.includes('-') ? product.key.split('-')[0] : null
    const hasBaseKey = !!baseKey && baseKey !== product.key

    const getUrl = (state) => {
        if (state === -1) return product.image
        const keyToUse = (state === 2 || state === 3) ? baseKey : product.key
        const type = (state === 0 || state === 2) ? 'cart-products-gray' : 'cart-products'
        return `https://webimages.terramarbrands.com.mx/shopping-cart/${type}/${keyToUse}.jpg`
    }

    const handleError = () => {
        setImageState(prev => {
            // If custom image fails, try standard flow
            if (prev === -1) return 0

            // Normal flow: 0 -> 1
            if (prev === 0) return 1

            // If we have a base key: 1 -> 2 -> 3 -> 4
            if (hasBaseKey) {
                if (prev === 1) return 2
                if (prev === 2) return 3
                return 4
            }

            // If no base key: 1 -> 4
            return 4
        })
    }

    if (imageState === 4) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 rounded-lg p-4 opacity-50">
                {/* Fallback to a generic brand icon or logo */}
                <img
                    src="/assets/logo.svg"
                    alt="Terramar"
                    className="w-12 h-12 mb-2 opacity-50 grayscale"
                />
                <span className="text-[10px] text-gray-400 font-medium text-center">Imagen no disponible</span>
            </div>
        )
    }

    return (
        <img
            src={getUrl(imageState)}
            alt={product.name}
            className="w-full h-full object-contain"
            onError={handleError}
            referrerPolicy="no-referrer"
        />
    )
}
