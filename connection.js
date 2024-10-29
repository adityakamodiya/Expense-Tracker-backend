import{MongoClient} from "mongodb"
const connection = MongoClient.connect("mongodb+srv://adityakamodiya:11223344@cluster0.j4ukslx.mongodb.net/ExpenseTracker?retryWrites=true&w=majority&appName=Cluster0")
export const dbName = "ExpenseTracker"
export default connection
// mongodb://127.0.0.1:27017
// 