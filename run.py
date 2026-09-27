# from app import create_app
# import os

# app = create_app()

# if __name__ == '__main__':
#     port = int(os.environ.get('PORT', 5000))
#     app.run(host='0.0.0.0', port=port, debug=False)



from app import create_app
import os
import logging

# Configure logging so scheduler/monitor output shows in terminal
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(name)s: %(message)s',
    datefmt='%H:%M:%S',
)

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)