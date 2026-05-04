# Add Payment Type to Billing

## Steps:
- [x] 1. Update backend/core/models.py: Add payment_type field to Billing model
- [x] 2. Update backend/core/serializers.py: Add payment_type to BillingSerializer fields
- [x] 3. Run Django migrations: cd backend && python manage.py makemigrations core && python manage.py migrate
- [x] 4. Update src/pages/admin/BillingAdmin.jsx: Add payment_type to form, state, table
- [ ] 5. Test: Restart dev server, create/edit billing with payment types, verify persistence/display

**Current progress: Starting step 1**
