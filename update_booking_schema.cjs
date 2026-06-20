const fs = require('fs');

function replaceAll(file, replacements) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    for (let r of replacements) {
        content = content.replace(r[0], r[1]);
    }
    fs.writeFileSync(file, content);
}

replaceAll('src/types.ts', [
    [`export interface Customer {
  name: string;
  phone: string;
  email: string;
}

export interface Booking {
  id: string;
  machine_id: string;
  customer: Customer;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  status: BookingStatus;
  totalCost: number;
  deliveryNeeded: boolean;
  deliveryAddress?: string;
  createdAt: string;
}`, `export interface Booking {
  booking_id: string;
  machine_id: string;
  hirer_name: string;
  hirer_phone: string;
  hirer_email: string;
  site_address: string;
  start_date: string;
  end_date: string;
  delivery_window: string;
  status: BookingStatus;
  qr_start_code: string;
  qr_end_code: string;
  timestamp_created: string;
  totalCost: number;
  deliveryNeeded: boolean;
}`]
]);

replaceAll('src/mockData.ts', [
    [`  {
    id: 'bk-1',
    machine_id: 'EX-030',
    customer: {
      name: 'John Smith',
      phone: '07700 900123',
      email: 'john@example.com'
    },
    startDate: formatDate(today),
    endDate: formatDate(tomorrow),
    status: 'active',
    totalCost: 220,
    deliveryNeeded: true,
    deliveryAddress: '12 High St, London',
    createdAt: new Date(today.getTime() - 86400000).toISOString()
  },
  {
    id: 'bk-2',
    machine_id: 'EX-015',
    customer: {
      name: 'Sarah Jones',
      phone: '07700 900456',
      email: 'sarah.j@example.com'
    },
    startDate: formatDate(tomorrow),
    endDate: formatDate(new Date(tomorrow.getTime() + 86400000 * 2)),
    status: 'confirmed',
    totalCost: 225,
    deliveryNeeded: false,
    createdAt: formatDate(today)
  }`, `  {
    booking_id: 'bk-1',
    machine_id: 'EX-030',
    hirer_name: 'John Smith',
    hirer_phone: '07700 900123',
    hirer_email: 'john@example.com',
    site_address: '12 High St, London',
    start_date: formatDate(today),
    end_date: formatDate(tomorrow),
    delivery_window: 'AM',
    status: 'active',
    qr_start_code: 'QR-BK1-START',
    qr_end_code: 'QR-BK1-END',
    timestamp_created: new Date(today.getTime() - 86400000).toISOString(),
    totalCost: 220,
    deliveryNeeded: true
  },
  {
    booking_id: 'bk-2',
    machine_id: 'EX-015',
    hirer_name: 'Sarah Jones',
    hirer_phone: '07700 900456',
    hirer_email: 'sarah.j@example.com',
    site_address: 'Collection',
    start_date: formatDate(tomorrow),
    end_date: formatDate(new Date(tomorrow.getTime() + 86400000 * 2)),
    delivery_window: 'None',
    status: 'confirmed',
    qr_start_code: 'QR-BK2-START',
    qr_end_code: 'QR-BK2-END',
    timestamp_created: formatDate(today),
    totalCost: 225,
    deliveryNeeded: false
  }`]
]);

replaceAll('src/store.tsx', [
    [`b.id === id`, `b.booking_id === id`],
    [`bookingId: string`, `id: string`],
    [`b.id === bookingId`, `b.booking_id === id`],
    [`bookingId`, `id`],
    [`bookingId`, `id`],
    [`b.id === bookingId`, `b.booking_id === id`]
]);

replaceAll('src/pages/customer/EquipmentDetails.tsx', [
    [`const newBooking = {
      id: \`bk-\${Date.now()}\`,
      equipmentId: item.machine_id,
      customer: { name, phone, email },
      startDate,
      endDate,
      status: 'pending' as const,
      totalCost: cost,
      deliveryNeeded,
      deliveryAddress: deliveryNeeded ? address : undefined,
      createdAt: new Date().toISOString()
    };`, `const newBooking = {
      booking_id: \`bk-\${Date.now()}\`,
      machine_id: item.machine_id,
      hirer_name: name,
      hirer_phone: phone,
      hirer_email: email,
      site_address: deliveryNeeded ? address : 'Collection',
      start_date: startDate,
      end_date: endDate,
      delivery_window: 'AM',
      status: 'pending' as const,
      qr_start_code: \`QR-START-\${Date.now()}\`,
      qr_end_code: \`QR-END-\${Date.now()}\`,
      timestamp_created: new Date().toISOString(),
      totalCost: cost,
      deliveryNeeded
    };`]
]);

replaceAll('src/pages/customer/BookingSuccess.tsx', [
    [`booking.startDate`, `booking.start_date`],
    [`booking.endDate`, `booking.end_date`],
    [`booking.customer.phone`, `booking.hirer_phone`]
]);

replaceAll('src/pages/operator/Dashboard.tsx', [
    [`parseISO(b.startDate)`, `parseISO(b.start_date)`],
    [`parseISO(b.endDate)`, `parseISO(b.end_date)`],
    [`b.id`, `b.booking_id`],
    [`b.customer.name`, `b.hirer_name`],
    [`b.id`, `b.booking_id`],
    [`b.customer.name`, `b.hirer_name`]
]);

replaceAll('src/pages/operator/HiresList.tsx', [
    [`new Date(a.startDate).getTime() - new Date(b.startDate).getTime()`, `new Date(a.start_date).getTime() - new Date(b.start_date).getTime()`],
    [`b.id`, `b.booking_id`],
    [`b.customer.name`, `b.hirer_name`],
    [`b.startDate`, `b.start_date`],
    [`b.endDate`, `b.end_date`]
]);

replaceAll('src/pages/operator/HireDetails.tsx', [
    [`b.id === id`, `b.booking_id === id`],
    [`booking.equipmentId`, `booking.machine_id`],
    [`booking.customer.name`, `booking.hirer_name`],
    [`booking.customer.phone`, `booking.hirer_phone`],
    [`booking.customer.phone`, `booking.hirer_phone`],
    [`booking.startDate`, `booking.start_date`],
    [`booking.endDate`, `booking.end_date`],
    [`booking.deliveryAddress`, `booking.site_address`],
    [`booking.id`, `booking.booking_id`],
    [`booking.id`, `booking.booking_id`],
    [`booking.id`, `booking.booking_id`],
    [`booking.id`, `booking.booking_id`]
]);

replaceAll('src/pages/operator/Scan.tsx', [
    [`target.id`, `target.booking_id`]
]);
