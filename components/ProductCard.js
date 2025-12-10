import React, { memo } from 'react'
import ProductImage from './ProductImage'
import { Plus, Minus } from 'lucide-react'

const ProductCard = memo(({ product, quantity, onAdd, onRemove, region = 'MX' }) => {
    // Determine price based on region
    let priceData = null

    if (region === 'MX') {
        // Default to root price if no specific MX price structure, but usually root IS MX
        priceData = (product.prices && product.prices.MX)
            ? product.prices.MX
            : { price: product.price, originalPrice: product.originalPrice }
    } else {
        // For other regions (US), ONLY use the specific region price
        // If not present, we will render a placeholder or "N/A"
        priceData = product.prices && product.prices[region] ? product.prices[region] : null
    }

    const price = priceData ? priceData.price : 0
    const originalPrice = priceData ? priceData.originalPrice : 0
    const isAvailable = price > 0

    return (
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center transition-all hover:shadow-md h-full relative">
            <div className="w-full aspect-square mb-2 relative flex items-center justify-center p-2 bg-gray-50 rounded-lg">
                <ProductImage product={product} />
            </div>

            {/* Clave Centrada y Visible */}
            <div className="text-sm text-yellow-600 font-bold mb-1">
                Clave: {product.key}
            </div>

            <h3 className="text-gray-800 font-bold text-xs md:text-sm mb-1 leading-tight line-clamp-2 h-8 md:h-10 w-full px-1">
                {product.name} {product.variant && <span className="text-gray-500 font-normal block text-[10px]">{product.variant}</span>}
            </h3>

            <div className="mb-3 w-full px-1">
                {isAvailable ? (
                    <>
                        {(() => {
                            let discountPercent = 0

                            if (originalPrice) {
                                discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100)
                            }

                            if (originalPrice && discountPercent > 0) {
                                return (
                                    <div className="flex items-center justify-center gap-1.5 mb-0.5">
                                        <span className="text-xs text-gray-400 line-through decoration-red-300">${originalPrice.toFixed(0)}</span>
                                        <span className="text-[10px] text-red-500 font-bold">-{discountPercent}%</span>
                                    </div>
                                )
                            }
                            return <div className="h-4 sm:h-[18px]"></div> // Spacer to keep alignment if no discount shown
                        })()}

                        <div className="text-lg md:text-xl font-bold text-blue-900">
                            ${price ? price.toFixed(2) : '0.00'}
                        </div>
                    </>
                ) : (
                    <div className="py-4 text-gray-400 text-sm font-medium italic">
                        No disponible en tu región
                    </div>
                )}
            </div>

            <div className="mt-auto w-full">
                {isAvailable ? (
                    quantity > 0 ? (
                        <div className="flex bg-cyan-50 text-cyan-700 rounded-lg overflow-hidden border border-cyan-100 shadow-sm">
                            <button
                                onClick={() => onRemove(product._id || product.key)}
                                className="px-3 py-1.5 hover:bg-cyan-100 transition-colors font-bold text-lg leading-none flex items-center justify-center"
                            ><Minus size={14} /></button>
                            <div className="flex-1 text-center py-1.5 font-bold text-sm flex items-center justify-center">
                                {quantity}
                            </div>
                            <button
                                onClick={() => onAdd({ ...product, price, originalPrice })}
                                className="px-3 py-1.5 hover:bg-cyan-100 transition-colors font-bold text-lg leading-none flex items-center justify-center"
                            ><Plus size={14} /></button>
                        </div>
                    ) : (
                        <button
                            onClick={() => onAdd({ ...product, price, originalPrice })}
                            className="w-full bg-white text-cyan-600 text-xs font-bold py-2 rounded-lg border border-cyan-600 hover:bg-cyan-50 transition-all flex items-center justify-center gap-1 shadow-sm active:scale-95"
                        >
                            <span>Agregar</span>
                        </button>
                    )
                ) : (
                    <button disabled className="w-full bg-gray-100 text-gray-400 text-xs font-bold py-2 rounded-lg border border-gray-200 cursor-not-allowed">
                        No Disponible
                    </button>
                )}
            </div>
        </div>
    )
})

ProductCard.displayName = 'ProductCard'

export default ProductCard
