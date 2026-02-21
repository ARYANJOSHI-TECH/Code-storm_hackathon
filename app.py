from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
from config import get_openai_client, get_supabase_client, SYSTEM_PROMPT
import json

app = Flask(__name__, static_folder='dist', static_url_path='/')
CORS(app)

def authenticate_user(auth_header):
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    
    token = auth_header.split(" ")[1]
    try:
        supabase = get_supabase_client()
        user_res = supabase.auth.get_user(token)
        return user_res.user
    except Exception as e:
        print(f"Auth error: {e}")
        return None

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})

@app.route('/api/generate-audit', methods=['POST'])
def generate_audit():
    user = authenticate_user(request.headers.get("Authorization"))
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    
    input_data = request.json
    try:
        client = get_openai_client()
        completion = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Analyze this user's life system using their data: {json.dumps(input_data)}"}
            ],
            response_format={"type": "json_object"}
        )
        
        ai_response = json.loads(completion.choices[0].message.content)
        
        # Save to Supabase
        supabase = get_supabase_client()
        supabase.table("audits").insert({
            "user_id": user.id,
            "input_data": input_data,
            "ai_response": ai_response
        }).execute()
        
        return jsonify(ai_response)
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/my-audits', methods=['GET'])
def get_audits():
    user = authenticate_user(request.headers.get("Authorization"))
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    
    try:
        supabase = get_supabase_client()
        res = supabase.table("audits").select("*").eq("user_id", user.id).order("created_at", desc=True).execute()
        return jsonify(res.data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Serve React App
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000)
