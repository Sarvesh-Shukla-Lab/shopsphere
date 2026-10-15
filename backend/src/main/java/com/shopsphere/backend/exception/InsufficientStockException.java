package com.shopsphere.backend.exception;

/**
 * Thrown when an order request exceeds available inventory stock during checkout.
 */
public class InsufficientStockException extends ShopSphereException {

    private final Long productId;
    private final int requestedQuantity;
    private final int availableStock;

    public InsufficientStockException(Long productId, int requestedQuantity, int availableStock) {
        super(String.format("Insufficient stock for product ID %d. Requested: %d, Available: %d",
                productId, requestedQuantity, availableStock), "INSUFFICIENT_STOCK");
        this.productId = productId;
        this.requestedQuantity = requestedQuantity;
        this.availableStock = availableStock;
    }

    public Long getProductId() {
        return productId;
    }

    public int getRequestedQuantity() {
        return requestedQuantity;
    }

    public int getAvailableStock() {
        return availableStock;
    }
}
