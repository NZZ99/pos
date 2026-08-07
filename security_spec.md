# Security Specification & Invariants (TCO Fresh POS)

## 1. Data Invariants

- **User Isolation**: No user should be able to read, write, or query another user's preferences, products, stock records, or sales records. The path parameters `{userId}` must strictly match the authenticated user's ID (`request.auth.uid`).
- **Product Validity**: All product additions or edits must supply a non-empty `id`, a unique `code` inside the user's dataset, a `name`, and valid prices (`retailPrice >= 0` and `wholesalePrice >= 0`).
- **Stock-In Integrity**: A stock-in record requires valid numerical fields (`qty > 0`, `purchasePrice >= 0`, `totalCost >= 0`).
- **Sale Integrity**: A sale record requires matching items, totals, and must not allow a regular user to modify or delete a voucher after completion (vouchers are terminal except when updating status to Refunded).

---

## 2. The "Dirty Dozen" Malicious Payloads (Permission Denied)

1. **Identity Spoofing on Preferences**: Trying to write user configuration to `users/attacker_uid` using credentials of `victim_uid`.
2. **PII Data Leakage**: Attempting to read another user's private preference data at `users/victim_uid`.
3. **Invalid ID Poisoning**: Attempting to create a product document with an extremely long ID containing malicious characters like `users/victim_uid/products/very_long_junk_id_12345%!#@`.
4. **Malicious Negative Price Injection**: Attempting to set a product's retail price to `-500` to break totals calculations.
5. **Zero Quantity Stock-In**: Creating a stock-in record with `qty = 0`.
6. **Negative Quantity Stock-In**: Creating a stock-in record with `qty = -5`.
7. **Bypassing Affected Keys on Update**: Trying to alter a product's `code` after creation when only prices and metadata are allowed to change.
8. **Altering Finished Voucher**: Modifying the sales total or item list of an already completed sale record.
9. **Tampering with Audit Logs**: Attempting to delete a sale record (`delete` operation should be disabled; only `status = 'Refunded'` updates are allowed).
10. **Unauthenticated Read**: Attempting to fetch the product list of a user without being signed in.
11. **Mass Scrape of Products**: Attempting to run a blanket list query across all users' products.
12. **Null/Empty Item Sale**: Submitting a sale record with an empty array of items.

---

## 3. Test Cases Draft

All the operations described above will return `PERMISSION_DENIED` under the generated security rules because they either cross user boundaries or fail structural validators.
