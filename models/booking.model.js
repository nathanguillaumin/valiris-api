const db = require('../db.js');

class Booking {
  static async getAll () {
    return db.query('SELECT DISTINCT b.id, c.firstname, c.lastname, b.starting_date, b.ending_date, m.content, b.validation FROM booking b LEFT JOIN contact c ON c.id = b.id_contact LEFT JOIN message m ON b.id = m.id_booking WHERE validation = 0');
  }

  static async findById (bookingId) {
    return db.query(`
    SELECT
    id,
    DATE_FORMAT(starting_date, "%Y-%m-%d") as starting_date, 
    DATE_FORMAT(booking.ending_date, "%Y-%m-%d") as ending_date,
    id_apartment,
    id_contact,
    validation
    FROM booking WHERE id = ?
    `, [bookingId]).then(rows => rows[0]);
  }

  static async createBooking (newBooking, contactId) {
    const fullBooking = { ...newBooking, id_contact: contactId, validation: 0 };
    return db.query('INSERT INTO booking SET ?', fullBooking)
      .then(res => {
        newBooking.id = res.insertId;
        newBooking.id_contact = contactId;
        return newBooking;
      });
  }

  static async createBookingBack (newBooking) {
    const fullBooking = { ...newBooking, validation: 1 };
    return db.query('INSERT INTO booking SET ?', fullBooking)
      .then(res => {
        newBooking.id = res.insertId;
        return newBooking;
      });
  }

  static async validateOne (bookingDetails) {
    return db.query('UPDATE booking SET validation = 1 WHERE id = ?', [bookingDetails.id])
      .then(row => db.query(`SELECT * FROM booking WHERE id = ${bookingDetails.id}`));
  }

  static async remove (id) {
    return db.query('DELETE FROM booking WHERE id = ?', [id]).then(res => {
      if (res.affectedRows !== 0) {
        return Promise.resolve();
      } else {
        const err = new Error();
        err.kind = 'not_found';
        return Promise.reject(err);
      }
    });
  }

  static async updateById (id, booking) {
    console.log(booking);
    return db.query(
      'UPDATE booking SET starting_date = ?, ending_date = ?, id_apartment = ?, id_contact = ?, validation = ? WHERE id = ?',
      [booking.starting_date, booking.ending_date, booking.id_apartment, booking.id_contact, booking.validation, id])
      .then(() => this.findById(id));
  }
}

module.exports = Booking;
