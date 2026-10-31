# Discounts Module (Person B)

## Implemented
- ADMIN-only discount creation
- Paginated discount list
- Percentage and Fixed discount schemas

## Next Tasks for Person B
- [ ] Concurrency-safe UPDATE Discount SET usedCount = usedCount + 1 WHERE id = $1 AND (usageLimit IS NULL OR usedCount < usageLimit)
- [ ] Emit discount.exhausted when usage limit is reached

