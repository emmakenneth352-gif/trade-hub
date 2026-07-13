import { Document, Query } from "mongoose";

interface QueryString {
  page?: string;
  sort?: string;
  limit?: string;
  fields?: string;
  [key: string]: unknown;
}

class ApiFeatures<T extends Document> {
  private query: Query<T[], T>;
  private queryString: QueryString;

  constructor(query: Query<T[], T>, queryString: QueryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter(): this {
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((field) => delete queryObj[field]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort(): this {
    if (this.queryString.sort) {
      const sortBy = String(this.queryString.sort).split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  limitFields(): this {
    if (this.queryString.fields) {
      const fields = String(this.queryString.fields).split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  paginate(): this {
    const page = parseInt(String(this.queryString.page || "1"), 10);
    const limit = parseInt(String(this.queryString.limit || "100"), 10);
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  getQuery(): Query<T[], T> {
    return this.query;
  }
}

export default ApiFeatures;
