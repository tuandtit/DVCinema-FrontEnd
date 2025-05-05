import { Component, OnInit } from '@angular/core';

interface Booking {
  id: number;
  user: string; // Tên người dùng
  movie: string; // Tên phim
  showtime: string; // Suất chiếu (thời gian)
  cinema: string; // Tên rạp
  seat: string; // Ghế
  totalPrice: number; // Tổng tiền (VND)
  status: 'paid' | 'pending'; // Trạng thái: Đã thanh toán hoặc Chưa thanh toán
}

@Component({
    selector: 'app-bookings',
    templateUrl: './bookings.component.html',
    styleUrls: ['./bookings.component.scss'],
    standalone: false
})
export class BookingsComponent implements OnInit {
  bookings: Booking[] = [
    { id: 1, user: 'Nguyen Van A', movie: 'The Matrix', showtime: '2025-04-26T14:00', cinema: 'DVCinema Quận 1', seat: 'A1', totalPrice: 120000, status: 'paid' },
    { id: 2, user: 'Tran Thi B', movie: 'Inception', showtime: '2025-04-25T19:00', cinema: 'DVCinema Quận 7', seat: 'B5', totalPrice: 150000, status: 'pending' },
    { id: 3, user: 'Le Van C', movie: 'Dune: Part Two', showtime: '2025-04-27T15:30', cinema: 'DVCinema Thủ Đức', seat: 'C3', totalPrice: 130000, status: 'paid' }
  ];

  filteredBookings: Booking[] = [...this.bookings]; // Danh sách đặt vé sau khi lọc/tìm kiếm
  searchTerm: string = '';
  statusFilter: string = 'all'; // Lọc theo trạng thái: all, paid, pending

  showAddForm: boolean = false; // Hiển thị form thêm đặt vé
  showEditForm: boolean = false; // Hiển thị form sửa đặt vé
  newBooking: Booking = { id: 0, user: '', movie: '', showtime: '', cinema: '', seat: '', totalPrice: 0, status: 'pending' };
  editBooking: Booking | null = null;

  ngOnInit(): void {
    this.filterBookings();
  }

  // Tìm kiếm và lọc đặt vé
  filterBookings(): void {
    let tempBookings = [...this.bookings];

    // Tìm kiếm theo tên người dùng
    if (this.searchTerm) {
      tempBookings = tempBookings.filter(booking =>
        booking.user.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Lọc theo trạng thái
    if (this.statusFilter !== 'all') {
      tempBookings = tempBookings.filter(booking => booking.status === this.statusFilter);
    }

    this.filteredBookings = tempBookings;
  }

  // Thêm đặt vé mới
  addBooking(): void {
    if (!this.newBooking.user || !this.newBooking.movie || !this.newBooking.showtime || !this.newBooking.cinema || !this.newBooking.seat || !this.newBooking.totalPrice) {
      alert('Vui lòng điền đầy đủ thông tin đặt vé!');
      return;
    }

    const newId = this.bookings.length ? Math.max(...this.bookings.map(b => b.id)) + 1 : 1;
    this.bookings.push({ ...this.newBooking, id: newId });
    this.filteredBookings = [...this.bookings];
    this.newBooking = { id: 0, user: '', movie: '', showtime: '', cinema: '', seat: '', totalPrice: 0, status: 'pending' };
    this.showAddForm = false;
    this.filterBookings();
  }

  // Mở form sửa đặt vé
  openEditForm(booking: Booking): void {
    this.editBooking = { ...booking };
    this.showEditForm = true;
  }

  // Sửa đặt vé
  updateBooking(): void {
    if (!this.editBooking) return;

    const index = this.bookings.findIndex(b => b.id === this.editBooking!.id);
    if (index !== -1) {
      this.bookings[index] = { ...this.editBooking };
      this.filteredBookings = [...this.bookings];
      this.editBooking = null;
      this.showEditForm = false;
      this.filterBookings();
    }
  }

  // Xóa đặt vé
  deleteBooking(id: number): void {
    if (confirm('Bạn có chắc muốn xóa đặt vé này?')) {
      this.bookings = this.bookings.filter(booking => booking.id !== id);
      this.filteredBookings = [...this.bookings];
      this.filterBookings();
    }
  }

  // Hủy form
  cancelForm(): void {
    this.showAddForm = false;
    this.showEditForm = false;
    this.newBooking = { id: 0, user: '', movie: '', showtime: '', cinema: '', seat: '', totalPrice: 0, status: 'pending' };
    this.editBooking = null;
  }

  // Định dạng tiền tệ VND
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  }

  // Định dạng thời gian
  formatDateTime(dateTime: string): string {
    const date = new Date(dateTime);
    return date.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
  }
}